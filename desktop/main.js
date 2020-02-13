const log = require('electron-log');
const argv = process.argv.slice(1);
log.transports.file.level = 'debug';
log.log(argv);
if (require('electron-squirrel-startup')) return;
const { app, ipcMain, BrowserWindow, Tray, nativeImage, protocol, Menu, autoUpdater, dialog, shell } = require('electron');
const path = require('path');
const Config = require('electron-config');
const config = new Config();
const isDev = require('electron-is-dev');
const Machina = require('./machina.js');

ipcMain.setMaxListeners(0);

const oauth = require('./oauth.js');

const BASE_APP_PATH = path.join(__dirname, '../dist/apps/client');

let win;
let tray;
let nativeIcon;

let openedOverlays = {};
let openedOverlayUris = [];

const options = {
  noHA: false
};

for (let i = 0; i < argv.length; i++) {
  if (argv[i] === '--noHardwareAcceleration' || argv[i] === '-noHA') {
    options.noHA = true;
  }
  if (argv[i] === '--verbose' || argv[i] === '-v') {
    options.verbose = true;
  }
  if (argv[i] === '--winpcap' || argv[i] === '-wp') {
    options.winpcap = true;
  }
}

function callUpdater(...args) {
  const cp = require('child_process');
  const updateDotExe = path.resolve(path.dirname(process.execPath), '..', 'Update.exe');
  cp.spawn(updateDotExe, args, { detached: true });
}

if (!isDev) {
  autoUpdater.setFeedURL({
    url: `https://update.ffxivteamcraft.com`
  });
  const target = path.basename(process.execPath);
  callUpdater('--createShortcut', target);
}

let deepLink = '';

if (options.noHA) {
  app.disableHardwareAcceleration();
}

/**
 * Autoupdater
 */

autoUpdater.on('checking-for-update', () => {
  log.log('Checking for update');
  win && win.webContents.send('checking-for-update', true);
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
  dialog.showMessageBox({
    type: 'info',
    title: 'FFXIV Teamcraft - Update available',
    message: 'An update has been installed, restart now to apply it?',
    buttons: ['Yes', 'No']
  }, (buttonIndex) => {
    if (buttonIndex === 0) {
      app.isQuitting = true;
      app.relaunch();
      app.exit(0);
    }
  });
});


ipcMain.on('update:check', () => {
  log.log('Run update setup');
  autoUpdater.checkForUpdates();
});

/**
 * End autoupdater
 */

function createWindow() {
  app.setAsDefaultProtocolClient('teamcraft');
  protocol.registerFileProtocol('teamcraft', function(request) {
    deepLink = request.url.substr(12);
    if (deepLink.endsWith('/')) {
      log.info(`Opening from File protocol: `, deepLink);
      deepLink = deepLink.substr(0, deepLink.length - 1);
    }
  });
  if (process.platform === 'win32' && process.argv.slice(1).toString().indexOf('--') === -1 && process.argv.slice(1).toString().indexOf('.js') === -1) {
    log.info(`Opening from argv : `, process.argv.slice(1));
    deepLink = process.argv.slice(1).toString().substr(12);
  } else {
    deepLink = config.get('router:uri') || '';
  }
  // It seems like somehow, this could happen.
  if (deepLink.indexOf('overlay') > -1) {
    deepLink = '';
  }
  let opts = {
    show: false,
    backgroundColor: '#000',
    autoHideMenuBar: true,
    frame: true,
    icon: `file://${BASE_APP_PATH}/assets/app-icon.png`,
    title: 'FFXIV Teamcraft',
    webPreferences: {
      nodeIntegration: true
    }
  };
  Object.assign(opts, config.get('win:bounds'));
  if (config.get('win:alwaysOnTop')) {
    opts.alwaysOnTop = true;
  }
  win = new BrowserWindow(opts);

  if (config.get('machina') === true) {
    Machina.start(win, config, options.verbose, options.winpcap);
  }

  win.loadURL(`file://${BASE_APP_PATH}/index.html#${deepLink}`);
  //// uncomment below to open the DevTools.
  // win.webContents.openDevTools();

  // Event when the window is closed.
  win.on('closed', function() {
    win = null;
    try {
      forEachOverlay(overlay => {
        if (overlay) {
          overlay.close();
        }
      });
    } catch (e) {
      // Window already destroyed, so we don't care :)
    }

  });

  win.on('app-command', (e, cmd) => {
    if (cmd === 'browser-backward' && win.webContents.canGoBack()) {
      win.webContents.goBack();
    }
    if (cmd === 'browser-forward' && win.webContents.canGoForward()) {
      win.webContents.goForward();
    }
  });

  win.once('ready-to-show', () => {
    if (!config.get('start-minimized')) {
      win.focus();
      win.show();
      if (config.get('win:fullscreen')) {
        win.maximize();
      }
    }
    if (config.get('start-minimized')) {
      tray.displayBalloon({
        title: 'Teamcraft launched in the background',
        content: 'To change this behavior, visit Settings -> Desktop.'
      });
    }
  });

  // save window size and position
  win.on('close', (event) => {
    if (!app.isQuitting && config.get('always-quit', true) === false) {
      event.preventDefault();
      win.hide();
      return false;
    }
    if (config.get('machina') === true) {
      Machina.stop();
    }
    config.set('overlays', openedOverlayUris);
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
  (config.get('overlays') || []).forEach(overlayUri => openOverlay({ url: overlayUri }));
}

function openOverlay(overlayConfig) {
  const url = overlayConfig.url;
  const dimensions = overlayConfig.defaultDimensions || { x: 800, y: 600 };
  let opts = {
    title: `FFXIV Teamcraft overlay - ${url}`,
    show: false,
    resizable: true,
    frame: false,
    autoHideMenuBar: true,
    width: dimensions.x,
    height: dimensions.y,
    webPreferences: {
      nodeIntegration: true
    }
  };
  Object.assign(opts, config.get(`overlay:${url}:bounds`));
  opts.opacity = config.get(`overlay:${url}:opacity`) || 1;
  const alwaysOnTop = config.get(`overlay:${url}:on-top`) || true;
  const overlay = new BrowserWindow(opts);
  overlay.setAlwaysOnTop(alwaysOnTop, 'screen-saver');
  overlay.setIgnoreMouseEvents(config.get('clickthrough') || false);

  overlay.once('ready-to-show', () => {
    overlay.show();
  });

  // save window size and position
  overlay.on('close', () => {
    config.set(`overlay:${url}:bounds`, overlay.getBounds());
    config.set(`overlay:${url}:opacity`, overlay.getOpacity());
    config.set(`overlay:${url}:on-top`, overlay.isAlwaysOnTop());
    delete openedOverlays[url];
    openedOverlayUris = openedOverlayUris.filter(uri => uri !== url);
  });


  overlay.loadURL(`file://${BASE_APP_PATH}/index.html#${url}?overlay=true`);
  openedOverlays[url] = overlay;
  openedOverlayUris.push(url);
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
      label: 'Fishing Overlay',
      type: 'normal',
      click: () => {
        openOverlay({ url: '/fishing-reporter-overlay' });
      }
    },
    {
      label: 'Alarm Overlay',
      type: 'normal',
      click: () => {
        openOverlay({ url: '/alarms-overlay' });
      }
    },
    {
      label: 'Quit',
      type: 'normal',
      click: () => {
        app.isQuitting = true;
        app.quit();
      }
    }
  ]);
  tray.setContextMenu(contextMenu);
}

function forEachOverlay(cb) {
  [].concat.apply([], Object.keys(openedOverlays).map(key => openedOverlays[key]))
    .forEach(overlay => {
      cb(overlay);
    });
}

function broadcast(eventName, data) {
  if (win) {
    win.webContents.send(eventName, data);
  }
  forEachOverlay(overlay => {
    overlay.webContents.send(eventName, data);
  });
}

ipcMain.on('app-ready', (event) => {
  if (options.nativeDecorator) {
    event.sender.send('window-decorator', false);
  }
});

ipcMain.on('toggle-machina', (event, enabled) => {
  config.set('machina', enabled);
  event.sender.send('toggle-machina:value', enabled);
  if (enabled) {
    Machina.start(win, config, options.verbose, options.winpcap);
  } else {
    Machina.stop();
  }
});

ipcMain.on('toggle-machina:get', (event) => {
  event.sender.send('toggle-machina:value', config.get('machina'));
});

let fishingState = {};
const overlaysNeedingFishingState = [
  '/fishing-reporter-overlay'
];
ipcMain.on('fishing-state:set', (_, data) => {
  fishingState = data;
  overlaysNeedingFishingState.forEach(uri => {
    if (openedOverlays[uri] !== undefined) {
      openedOverlays[uri].webContents.send('fishing-state', data);
    }
  });
});

ipcMain.on('fishing-state:get', (event) => {
  event.sender.send('fishing-state', fishingState);
});


let appState = {};
const overlaysNeedingState = [
  '/list-panel-overlay'
];
ipcMain.on('app-state:set', (_, data) => {
  appState = data;
  overlaysNeedingState.forEach(uri => {
    if (openedOverlays[uri] !== undefined) {
      openedOverlays[uri].webContents.send('app-state', data);
    }
  });
});

ipcMain.on('app-state:get', (event) => {
  event.sender.send('app-state', appState);
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
    app.isQuitting = true;
    app.quit();
  }
});

app.on('activate', function() {
  // macOS specific close process
  if (win === null) {
    createWindow();
  }
});

ipcMain.on('apply-settings', (event, settings) => {
  try {
    config.set('clickthrough', settings.clickthrough === 'true');
    forEachOverlay(overlay => {
      overlay.setIgnoreMouseEvents(settings.clickthrough === 'true');
      overlay.webContents.send('update-settings', settings);
    });
    win.webContents.send('update-settings', settings);
  } catch (e) {
    // Window already destroyed, so we don't care :)
  }
});

ipcMain.on('language', (event, lang) => {
  try {
    forEachOverlay(overlay => {
      overlay.webContents.send('apply-language', lang);
    });
  } catch (e) {
    // Window already destroyed, so we don't care :)
  }
});

ipcMain.on('show-devtools', () => {
  win.webContents.openDevTools();
});

ipcMain.on('open-link', (event, url) => {
  shell.openExternal(url);
});

ipcMain.on('log', (event, entry) => {
  log.log(entry);
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

ipcMain.on('always-on-top', (event, onTop) => {
  config.set('win:alwaysOnTop', onTop);
  win.setAlwaysOnTop(onTop, 'normal');
});

ipcMain.on('always-on-top:get', (event) => {
  event.sender.send('always-on-top:value', config.get('win:alwaysOnTop'));
});

ipcMain.on('always-quit', (event, flag) => {
  config.set('always-quit', flag);
});

ipcMain.on('always-quit:get', (event) => {
  event.sender.send('always-quit:value', config.get('always-quit', true));
});

ipcMain.on('start-minimized', (event, flag) => {
  config.set('start-minimized', flag);
});

ipcMain.on('start-minimized:get', (event) => {
  event.sender.send('start-minimized:value', config.get('start-minimized'));
});

ipcMain.on('overlay', (event, data) => {
  openOverlay(data);
});

ipcMain.on('overlay:set-opacity', (event, data) => {
  const overlayWindow = openedOverlays[data.uri];
  if (overlayWindow !== undefined && overlayWindow) {
    overlayWindow.setOpacity(data.opacity);
  }
});

ipcMain.on('overlay:get-opacity', (event, data) => {
  const overlayWindow = openedOverlays[data.uri];
  if (overlayWindow !== undefined) {
    event.sender.send(`overlay:${data.uri}:opacity`, overlayWindow.getOpacity());
  }
});

ipcMain.on('overlay:set-on-top', (event, data) => {
  const overlayWindow = openedOverlays[data.uri];
  if (overlayWindow !== undefined) {
    overlayWindow.setAlwaysOnTop(data.onTop, 'screen-saver');
  }
});

ipcMain.on('overlay:get-on-top', (event, data) => {
  const overlayWindow = openedOverlays[data.uri];
  if (overlayWindow !== undefined) {
    event.sender.send(`overlay:${data.uri}:on-top`, overlayWindow.isAlwaysOnTop());
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
