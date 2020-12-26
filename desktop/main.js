/**
 * Squirrel stuff
 */
const log = require('electron-log');
const argv = process.argv.slice(1);
log.transports.file.level = 'debug';
log.log(argv);
const Config = require('electron-config');
const config = new Config();
const ChildProcess = require('child_process');
if (require('electron-squirrel-startup')) return;

const mainWindowPort = 14500;

function handleSquirrelEvent() {
  if (process.argv.length === 1) {
    return false;
  }
  const path = require('path');

  const appFolder = path.resolve(process.execPath, '..');
  const rootAtomFolder = path.resolve(appFolder, '..');
  const updateDotExe = path.resolve(path.join(rootAtomFolder, 'Update.exe'));
  const exeName = path.basename(process.execPath);

  const spawn = function(command, args) {
    let spawnedProcess;
    log.log('Spawn update', args);

    try {
      spawnedProcess = ChildProcess.spawn(command, args, { detached: true });
    } catch (error) {
      log.log('ERROR Spawning update.exe', error);
    }

    return spawnedProcess;
  };

  const spawnUpdate = function(args) {
    return spawn(updateDotExe, args);
  };


  const squirrelEvent = process.argv[1];
  switch (squirrelEvent) {
    case '--squirrel-install':
    case '--squirrel-firstrun':
      if (!config.get('setup:noShortcut')) {
        spawnUpdate(['--createShortcut', exeName]);
      }
      Machina.addMachinaFirewallRule();
      break;
    case '--squirrel-updated':
      // Optionally do things such as:
      // - Add your .exe to the PATH
      // - Write to the registry for things like file associations and
      //   explorer context menus
      // Remove previous firewall rules
      ChildProcess.exec('netsh advfirewall firewall delete rule name="ffxiv teamcraft.exe"');
      Machina.addMachinaFirewallRule();
      // Install desktop and start menu shortcuts
      if (!config.get('setup:noShortcut')) {
        spawnUpdate(['--createShortcut', exeName]);
      }

      setTimeout(app.quit, 1000);
      return true;

    case '--squirrel-uninstall':
      // Undo anything you did in the --squirrel-install and
      // --squirrel-updated handlers

      // Remove desktop and start menu shortcuts
      spawnUpdate(['--removeShortcut', exeName]);

      setTimeout(app.quit, 1000);
      return true;

    case '--squirrel-obsolete':
      // This is called on the outgoing version of your app before
      // we update to the new version - it's the opposite of
      // --squirrel-updated

      app.quit();
      return true;
  }
}

/**
 * End of squirrel stuff
 */

const { app, ipcMain, BrowserWindow, Tray, nativeImage, protocol, Menu, autoUpdater, dialog, shell } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const Machina = require('./machina.js');
const Zanarkand = require('./zanarkand.js');
const fs = require('fs-extra');
const net = require('net');
const http = require('http');
const request = require('request');
app.commandLine.appendSwitch('disable-renderer-backgrounding');

ipcMain.setMaxListeners(0);

const oauth = require('./oauth.js');

const BASE_APP_PATH = path.join(__dirname, '../dist/apps/client');

/**
 * Port tooling
 */
const isPortTaken = (port, fn) => {
  const tester = net.createServer()
    .once('error', function(err) {
      if (err.code !== 'EADDRINUSE') return fn(err);
      fn(null, true);
    })
    .once('listening', function() {
      tester.once('close', function() {
        fn(null, false);
      })
        .close();
    })
    .listen(port);
};

/**
 * @type {BrowserWindow}
 */
let win;
let tray;
let nativeIcon;
let httpServer;

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
    config.set('winpcap', true);
  }
  if (argv[i] === '-pid') {
    options.pid = +argv[i + 1];
  }
}

if (!isDev) {
  autoUpdater.setFeedURL({
    url: `https://update.ffxivteamcraft.com`
  });
}

let deepLink = '';

if (options.noHA) {
  app.disableHardwareAcceleration();
}

/**
 * Autoupdater
 */

let autoUpdaterRunning = false;
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
  autoUpdaterRunning = false;
  win && win.webContents.send('update-available', false);
});

autoUpdater.on('error', (err) => {
  log.log('Updater Error', err);
  autoUpdaterRunning = false;
  win && win.webContents.send('update-available', false);
});

autoUpdater.on('update-downloaded', () => {
  log.log('Update downloaded');
  autoUpdaterRunning = false;
  dialog.showMessageBox({
    type: 'info',
    title: 'FFXIV Teamcraft - Update available',
    message: 'An update has been installed, restart now to apply it?',
    buttons: ['Yes', 'No']
  }).then(result => {
    if (result.response === 0) {
      app.isQuitting = true;
      autoUpdater.quitAndInstall();
    }
  });
});


ipcMain.on('update:check', () => {
  if (autoUpdaterRunning) {
    return;
  }

  log.log('Run update setup');
  autoUpdaterRunning = true;
  autoUpdater.checkForUpdates();
});

function sendToAlreadyOpenedTC(url) {
  request(`http://localhost:${mainWindowPort}${url}`);
}

/**
 * End autoupdater
 */
// Create window on electron intialization
app.on('ready', () => {
  handleSquirrelEvent();

  if (config.get('machina')) {
    config.set('pcap', true);
  }

  isPortTaken(mainWindowPort, (err, taken) => {
    if (taken) {
      sendToAlreadyOpenedTC((argv[0] || '').replace('teamcraft://', ''));
    } else {
      createWindow();
      createTray();
      httpServer = http.createServer((req, res) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Request-Method', '*');
        res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
        res.setHeader('Access-Control-Allow-Headers', '*');
        if (req.method === 'OPTIONS') {
          res.writeHead(200);
          res.end();
          return;
        }
        win.focus();
        win.show();
        if (req.url.length > 1) {
          win.webContents.send('navigate', req.url);
        }
        res.writeHead(200);
        res.end();
      }).listen(mainWindowPort, 'localhost');
    }
  });
});

function startPcap() {
  if (config.get('pcapMode', 'Zanarkand') === 'Machina') {
    Machina.start(win, config, options.verbose, config.get('winpcap'), options.pid);
  } else {
    Zanarkand.start(win, config, options.verbose);
  }
}

function stopPcap() {
  if (config.get('pcapMode', 'Zanarkand') === 'Machina') {
    Machina.stop();
  } else {
    Zanarkand.stop();
  }
}

function createWindow() {
  app.releaseSingleInstanceLock();
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
  win = new BrowserWindow(opts);

  if (config.get('pcap') === true) {
    startPcap();
  }

  const proxyRule = config.get('proxy-rule', '');
  const proxyPac = config.get('proxy-pac', '');
  if (proxyRule || proxyPac) {
    setProxy({
      rule: proxyRule,
      pac: proxyPac
    });
  }

  win.loadURL(`file://${BASE_APP_PATH}/index.html#${deepLink}`);
  win.setAlwaysOnTop(config.get('win:alwaysOnTop') || false, 'normal');
  //// uncomment below to open the DevTools.
  // win.webContents.openDevTools();

  // Event when the window is closed.
  win.on('closed', function() {
    win = null;
    httpServer;
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
    if (config.get('pcap') === true) {
      stopPcap();
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
  (config.get('overlays') || []).forEach(overlayUri => toggleOverlay({ url: overlayUri }));
}

function toggleOverlay(overlayConfig) {
  const url = overlayConfig.url;
  if (openedOverlays[url]) {
    openedOverlays[url].close();
    afterOverlayClose(url);
    return;
  }
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
      nodeIntegration: true,
      backgroundThrottling: false
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
    afterOverlayClose(url);
  });


  overlay.loadURL(`file://${BASE_APP_PATH}/index.html#${url}?overlay=true`);
  openedOverlays[url] = overlay;
  openedOverlayUris.push(url);
}

function afterOverlayClose(url) {
  const overlay = openedOverlays[url];
  if (!overlay) {
    return;
  }
  config.set(`overlay:${url}:bounds`, overlay.getBounds());
  config.set(`overlay:${url}:opacity`, overlay.getOpacity());
  config.set(`overlay:${url}:on-top`, overlay.isAlwaysOnTop());
  delete openedOverlays[url];
  openedOverlayUris = openedOverlayUris.filter(uri => uri !== url);
}

function applySettings(settings) {
  try {
    if (config.get('region') !== settings.region) {
      config.set('region', settings.region);

      if (config.get('pcap') === true) {
        stopPcap();
        startPcap();
      }
    }

    config.set('clickthrough', settings.clickthrough === 'true');
    forEachOverlay(overlay => {
      overlay.setIgnoreMouseEvents(settings.clickthrough === 'true');
      overlay.webContents.send('update-settings', settings);
    });
    win.webContents.send('update-settings', settings);
  } catch (e) {
    // Window already destroyed, so we don't care :)
  }
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
  win.webContents
    .executeJavaScript('localStorage.getItem("settings") || "{}";', true)
    .then(settingsString => {
      const settings = JSON.parse(settingsString);
      tray.setToolTip('FFXIV Teamcraft');
      const contextMenu = Menu.buildFromTemplate([
        {
          label: 'Item Search Overlay',
          type: 'normal',
          click: () => {
            toggleOverlay({ url: '/item-search-overlay' });
          }
        },
        {
          label: 'List Overlay',
          type: 'normal',
          click: () => {
            toggleOverlay({ url: '/list-panel-overlay' });
          }
        },
        {
          label: 'Fishing Overlay',
          type: 'normal',
          click: () => {
            toggleOverlay({ url: '/fishing-reporter-overlay' });
          }
        },
        {
          label: 'Alarm Overlay',
          type: 'normal',
          click: () => {
            toggleOverlay({ url: '/alarms-overlay' });
          }
        },
        {
          label: 'Clickthrough Overlays',
          type: 'checkbox',
          checked: settings.clickthrough === 'true',
          click: (menuItem) => {
            settings.clickthrough = menuItem.checked.toString();
            applySettings(settings);
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
    });
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

function setProxy({ rule, pac, bypass }) {
  const ses = win.webContents.session;
  ses.setProxy({
    proxyRules: rule || config.get('proxy-rule'),
    proxyBypassRules: bypass || config.get('proxy-bypass'),
    pacScript: pac || config.get('proxy-pac')
  });
}

ipcMain.on('app-ready', (event) => {
  if (options.nativeDecorator) {
    event.sender.send('window-decorator', false);
  }
});

ipcMain.on('toggle-pcap', (event, enabled) => {
  config.set('pcap', enabled);
  event.sender.send('toggle-pcap:value', enabled);
  if (enabled) {
    startPcap();
  } else {
    stopPcap();
  }
});

ipcMain.on('toggle-pcap:get', (event) => {
  event.sender.send('toggle-pcap:value', config.get('pcap'));
});

ipcMain.on('pcap-mode', (event, mode) => {
  stopPcap();
  config.set('pcapMode', mode);
  event.sender.send('pcap-mode:value', mode);
  startPcap();
});

ipcMain.on('pcap-mode:get', (event) => {
  event.sender.send('pcap-mode:value', config.get('pcapMode', 'Zanarkand'));
});

ipcMain.on('proxy-rule', (event, value) => {
  config.set('proxy-rule', value);
  event.sender.send('proxy-rule:value', value);

  setProxy({
    rule: value
  });
});

ipcMain.on('proxy-rule:get', (event) => {
  event.sender.send('proxy-rule:value', config.get('proxy-rule'));
});

ipcMain.on('proxy-bypass', (event, value) => {
  config.set('proxy-bypass', value);
  event.sender.send('proxy-bypass:value', value);

  setProxy({
    bypass: value
  });
});

ipcMain.on('proxy-bypass:get', (event) => {
  event.sender.send('proxy-bypass:value', config.get('proxy-bypass'));
});

ipcMain.on('proxy-pac', (event, value) => {
  config.set('proxy-pac', value);
  event.sender.send('proxy-pac:value', value);

  setProxy({
    pac: value
  });
});

ipcMain.on('proxy-pac:get', (event) => {
  event.sender.send('proxy-pac:value', config.get('proxy-pac'));
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

let mappyState = {};
ipcMain.on('mappy-state:set', (_, data) => {
  mappyState = data;
  if (openedOverlays['/mappy-overlay'] !== undefined) {
    openedOverlays['/mappy-overlay'].webContents.send('mappy-state', data);
  }
});

ipcMain.on('mappy-state:get', (event) => {
  event.sender.send('mappy-state', mappyState);
});

ipcMain.on('mappy:reload', (event) => {
  win.webContents.send('mappy:reload');
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
  applySettings(settings);
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

// Metrics system
const APP_DATA = process.env.APPDATA || (process.platform === 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + '/.local/share');
let METRICS_FOLDER = config.get('metrics:folder') || path.join(APP_DATA, `ffxiv-teamcraft-metrics${isDev ? '-dev' : ''}`);

if (!fs.existsSync(METRICS_FOLDER)) {
  fs.mkdirSync(METRICS_FOLDER);
}

ipcMain.on('metrics:persist', (event, data) => {
  if (data.length === 0) {
    return;
  }
  const now = new Date();
  let month = now.getMonth();
  if (month < 10) {
    month = `0${month}`;
  }
  let day = now.getUTCDate();
  if (day < 10) {
    day = `0${day}`;
  }
  const filename = `${now.getFullYear()}${month}${day}.tcmetrics`;
  const filePath = path.join(METRICS_FOLDER, filename);
  if (fs.existsSync(filePath)) {
    data = `|${data}`;
  }
  fs.appendFileSync(filePath, data);
});

ipcMain.on('metrics:load', (event, { from, to }) => {
  if (to === undefined) {
    to = Date.now();
  }
  const files = fs.readdirSync(METRICS_FOLDER);
  const loadedFiles = files
    .filter(fileName => {
      const date = +fileName.split('.')[0];
      return date >= from && date <= to;
    })
    .map(fileName => fs.readFileSync(path.join(METRICS_FOLDER, fileName), 'utf8'));
  event.sender.send('metrics:loaded', loadedFiles);
});

ipcMain.on('metrics:path:get', (event) => {
  event.sender.send('metrics:path:value', METRICS_FOLDER);
});

ipcMain.on('metrics:path:set', (event, value) => {
  const folderPickerOptions = {
    // See place holder 2 in above image
    defaultPath: METRICS_FOLDER,
    properties: ['openDirectory']
  };
  dialog.showOpenDialog(win, folderPickerOptions).then((result) => {
    if (result.canceled) {
      return;
    }
    const value = result.filePaths[0];
    fs.moveSync(METRICS_FOLDER, value);
    METRICS_FOLDER = value;
    config.set('metrics:folder', value);
    event.sender.send('metrics:path:value', METRICS_FOLDER);
  });
});
// End metrics system


ipcMain.on('winpcap:get', (event) => {
  event.sender.send('winpcap:value', config.get('winpcap'));
});

ipcMain.on('winpcap:set', (event, flag) => {
  config.set('winpcap', flag);
  stopPcap();
  startPcap();
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

ipcMain.on('no-shortcut', (event, noShortcut) => {
  config.set('setup:noShortcut', noShortcut);
});

ipcMain.on('no-shortcut:get', (event) => {
  event.sender.send('no-shortcut:value', config.get('setup:noShortcut') || false);
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
  toggleOverlay(data);
});

ipcMain.on('machina:firewall:set-rule', (event) => {
  Machina.addMachinaFirewallRule();
  event.sender.send('machina:firewall:rule-set', true);
});

ipcMain.on('overlay:set-opacity', (event, data) => {
  const overlayWindow = openedOverlays[data.uri];
  if (overlayWindow !== undefined && overlayWindow) {
    overlayWindow.setOpacity(data.opacity);
  }
});

ipcMain.on('overlay:open-page', (event, data) => {
  win.webContents.send('navigate', data);
  win.focus();
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

ipcMain.on('zoom-in', () => {
  var currentzoom = win.webContents.getZoomLevel();
  win.webContents.setZoomLevel(currentzoom++);
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
