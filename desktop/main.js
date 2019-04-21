const { app, ipcMain, BrowserWindow, Tray, nativeImage, dialog, protocol, Menu } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const Config = require('electron-config');
const config = new Config();
const isDev = require('electron-is-dev');
const log = require('electron-log');
log.transports.file.level = 'info';
const express = require('express');

const oauth = require('./oauth.js');

const argv = process.argv.slice(1);

const BASE_APP_PATH = path.join(__dirname, '../dist/apps/client');

let win;
let tray;
let nativeIcon;

let updateInterval;

let openedOverlays = {};

const options = {
  multi: false
};

for (let i = 0; i < argv.length; i++) {
  if (argv[i] === '--multi' || argv[i] === '-m') {
    options.multi = true;
  }
}

if (isDev) {
  // autoUpdater.updateConfigPath = path.join(__dirname, 'dev-app-update.yml');
}

if (!options.multi) {
  const shouldQuit = app.makeSingleInstance(function(commandLine) {
    // Someone tried to run a second instance, we should focus our window.
    if (win && !options.multi) {
      const cmdLine = commandLine[1];
      if (cmdLine) {
        let path = commandLine[1].substr(12);
        log.info(`Opening from second-instance : `, path);
        win && win.webContents.send('navigate', path);
        win.focus();
      }
      if (win.isMinimized()) win.restore();
      win.focus();
    }
  });

  if (shouldQuit) {
    app.quit();
    return;
  }
}

let deepLink = '';

let api;

function createWindow() {
  app.setAsDefaultProtocolClient('teamcraft');
  protocol.registerFileProtocol('teamcraft', function(request) {
    deepLink = request.url.substr(12);
    if (deepLink.endsWith('/')) {
      log.info(`Opening from File protocol: `, deepLink);
      deepLink = deepLink.substr(0, deepLink.length - 1);
    }
  });
  if (process.platform === 'win32') {
    log.info(`Opening from argv : `, process.argv.slice(1));
    deepLink = process.argv.slice(1).toString().substr(12);
  } else {
    deepLink = config.get('router:uri') || '';
  }
  let opts = {
    show: false,
    backgroundColor: '#000',
    frame: true,
    icon: `file://${BASE_APP_PATH}/assets/app-icon.png`,
    title: 'FFXIV Teamcraft'
  };
  Object.assign(opts, config.get('win:bounds'));
  if (config.get('win:alwaysOnTop')) {
    opts.alwaysOnTop = true;
  }
  win = new BrowserWindow(opts);
  if (config.get('win:fullscreen')) {
    win.maximize();
  }

  win.loadURL(`file://${BASE_APP_PATH}/index.html#${deepLink}`);
  //// uncomment below to open the DevTools.
  // win.webContents.openDevTools();

  // Event when the window is closed.
  win.on('closed', function() {
    win = null;
  });

  win.once('ready-to-show', () => {
    if (api === undefined) {
      // Start the api server for app detection
      api = express();

      api.use(function(req, res, next) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
        next();
      });

      api.get('/', (req, res) => {
        res.send('OK');
      });

      api.listen(7331);
    }

    win.focus();
    win.show();
    autoUpdater.checkForUpdates();
    updateInterval = setInterval(() => {
      autoUpdater.checkForUpdates();
    }, 300000);
  });

  // save window size and position
  win.on('close', () => {
    config.set('win:bounds', win.getBounds());
    config.set('win:fullscreen', win.isMaximized());
    config.set('win:alwaysOnTop', win.isAlwaysOnTop());
    config.set('router:uri', deepLink);
  });

  const iconPath = path.join(BASE_APP_PATH, 'assets/app-icon.png');
  nativeIcon = nativeImage.createFromPath(iconPath);

  const handleRedirect = (e, url) => {
    if (url !== win.webContents.getURL()) {
      e.preventDefault();
      require('electron').shell.openExternal(url);
    }
  };

  win.webContents.on('will-navigate', handleRedirect);
  win.webContents.on('new-window', handleRedirect);
  win.on('show', () => {
    tray.setHighlightMode('always');
  });
  win.on('hide', () => {
    tray.setHighlightMode('never');
  });
}

function openOverlay(url) {
  let opts = {
    title: `FFXIV Teamcraft overlay - ${url}`,
    show: false,
    resizable: true,
    frame: false,
    alwaysOnTop: true,
    autoHideMenuBar: true
  };
  Object.assign(opts, config.get(`overlay:${url}:bounds`));
  opts.opacity = config.get(`overlay:${url}:opacity`) || 1;
  const overlay = new BrowserWindow(opts);

  overlay.once('ready-to-show', () => {
    overlay.show();
  });

  // save window size and position
  overlay.on('close', () => {
    config.set(`overlay:${url}:bounds`, overlay.getBounds());
    config.set(`overlay:${url}:opacity`, overlay.getOpacity());
  });


  overlay.loadURL(`file://${BASE_APP_PATH}/index.html#${url}?overlay=true`);
  openedOverlays[url] = overlay;
}

function createTray() {
  const trayIcon = nativeIcon.resize({ width: 16, height: 16 });
  tray = new Tray(trayIcon);
  tray.on('balloon-click', () => {
    if (win === null) {
      createWindow();
    }
    !win.isVisible() ? win.show() : null;
  });
  tray.on('click', () => {
    if (win === null) {
      createWindow();
    }
    win.isVisible() ? win.hide() : win.show();
  });
  tray.setToolTip('FFXIV Teamcraft');
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Alarm Overlay',
      type: 'normal',
      click: () => {
        openOverlay('/alarms-overlay');
      }
    }
  ]);
  tray.setContextMenu(contextMenu);
}

ipcMain.on('app-ready', (event) => {
  if (options.nativeDecorator) {
    event.sender.send('window-decorator', false);
  }
});

// Create window on electron intialization
app.on('ready', () => {
  createWindow();
  createTray();
});

// Quit when all windows are closed.
app.on('window-all-closed', function() {

  // On macOS specific close process
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function() {
  // macOS specific close process
  if (win === null) {
    createWindow();
  }
});

autoUpdater.on('checking-for-update', () => {
  log.log('Checking for update');
  win && win.webContents.send('checking-for-update', true);
});

autoUpdater.on('download-progress', (progress) => {
  win && win.webContents.send('download-progress', progress);
});

autoUpdater.on('update-available', () => {
  log.log('Update available');
  win && win.webContents.send('update-available', true);
});

autoUpdater.on('update-not-available', () => {
  log.log('No update found');
  win && win.webContents.send('update-available', false);
});

autoUpdater.on('update-downloaded', () => {
  log.log('Update downloaded');
  clearInterval(updateInterval);
  dialog.showMessageBox({
    type: 'info',
    title: 'FFXIV Teamcraft - Update available',
    message: 'An update is available and downloaded, install now?',
    buttons: ['Yes', 'No']
  }, (buttonIndex) => {
    if (buttonIndex === 0) {
      autoUpdater.quitAndInstall();
    }
  });
});

ipcMain.on('apply-settings', (event, settings) => {
  Object.keys(openedOverlays).forEach(key => {
    openedOverlays[key].webContents.send('update-settings', settings);
  });
});

ipcMain.on('language', (event, lang) => {
  Object.keys(openedOverlays).forEach(key => {
    openedOverlays[key].webContents.send('apply-language', lang);
  });
});

ipcMain.on('show-devtools', () => {
  win.webContents.openDevTools();
});

ipcMain.on('notification', (event, config) => {
  // Override icon for now, as getting the icon from url doesn't seem to be working properly.
  config.icon = nativeIcon;
  tray.displayBalloon(config);
});

ipcMain.on('clear-cache', () => {
  win.webContents.session.clearStorageData(() => {
    app.relaunch();
    app.exit(0);
  });
});

ipcMain.on('run-update', () => {
  log.log('Run update setup');
  autoUpdater.quitAndInstall(true, true);
});

ipcMain.on('always-on-top', (event, onTop) => {
  win.setAlwaysOnTop(onTop, 'floating');
});

ipcMain.on('always-on-top:get', (event) => {
  event.sender.send('always-on-top:value', win.alwaysOnTop);
});

ipcMain.on('always-on-top', (event, onTop) => {
  win.setAlwaysOnTop(onTop, 'floating');
});

ipcMain.on('always-on-top:get', (event) => {
  event.sender.send('always-on-top:value', win.alwaysOnTop);
});

ipcMain.on('overlay', (event, url) => {
  openOverlay(url);
});

ipcMain.on('overlay:set-opacity', (event, data) => {
  const overlayWindow = openedOverlays[data.uri];
  if (overlayWindow !== undefined) {
    overlayWindow.setOpacity(data.opacity);
  }
});

ipcMain.on('overlay:get-opacity', (event, data) => {
  const overlayWindow = openedOverlays[data.uri];
  if (overlayWindow !== undefined) {
    event.sender.send(`overlay:${data.uri}:opacity`, overlayWindow.getOpacity());
  }
});

ipcMain.on('overlay-close', (event, url) => {
  if (openedOverlays[url] !== undefined) {
    openedOverlays[url].close();
  }
});

ipcMain.on('fullscreen-toggle', () => {
  if (win.isMaximized()) {
    win.unmaximize();
  } else {
    win.maximize();
  }
});

ipcMain.on('minimize', () => {
  win.minimize();
});

ipcMain.on('navigated', (event, uri) => {
  deepLink = uri;
});

ipcMain.on('update:check', () => {
  log.log('Renderer asked for an update check');
  autoUpdater.checkForUpdates();
});

// Oauth stuff
ipcMain.on('oauth', (event, providerId) => {
  if (providerId === 'google.com') {
    const provider = {
      authorize_url: 'https://accounts.google.com/o/oauth2/auth',
      client_id: '1082504004791-qjnubk6kj80kfvn3mg86lmu6eba16c6l.apps.googleusercontent.com',
      redirect_uri: 'http://localhost'
    };
    oauth(provider).getCode({ scope: 'https://www.googleapis.com/auth/userinfo.profile' }).then(code => {
      event.sender.send('oauth-reply', code);
    });
  }
  if (providerId === 'facebook.com') {
    const provider = {
      authorize_url: 'https://www.facebook.com/v3.0/dialog/oauth',
      client_id: '2276769899216306',
      redirect_uri: 'http://localhost'
    };
    oauth(provider).getCode({}).then(code => {
      event.sender.send('oauth-reply', code);
    });
  }
  if (providerId === 'discordapp.com') {
    const provider = {
      authorize_url: 'https://discordapp.com/api/oauth2/authorize',
      client_id: '514350168678727681',
      redirect_uri: 'http://localhost'
    };
    oauth(provider).getCode({ scope: 'webhook.incoming' }).then(code => {
      event.sender.send('oauth-reply', code);
    });
  }
  if (providerId === 'patreon.com') {
    const provider = {
      authorize_url: 'https://www.patreon.com/oauth2/authorize',
      client_id: 'MMmud8pCDGgQkhd8H2g_SpRWgzvCYwyawjSqmvjl_pjOA7Yco6Cp-Ljv8InmGMUE',
      redirect_uri: 'http://localhost'
    };
    oauth(provider).getCode({ scope: 'identity' }).then(code => {
      event.sender.send('oauth-reply', code);
    });
  }
});
