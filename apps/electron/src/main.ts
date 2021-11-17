import { MainWindow } from './window/main-window';
import { Store } from './store';
import { OverlayManager } from './window/overlay-manager';
import { PacketCapture } from './pcap/packet-capture';
import { TrayMenu } from './window/tray-menu';
import { IpcListenersManager } from './ipc/ipc-listeners-manager';
import { SquirrelEventHandler } from './update/squirrel-event-handler';
import { TeamcraftDesktopApp } from './teamcraft-desktop-app';
import { ProxyManager } from './tools/proxy-manager';
import * as log from 'electron-log';
import { app, ipcMain } from 'electron';
import { DatFilesWatcher } from './dat/dat-files-watcher';
import { MetricsSystem } from './ipc/metrics-system';
import { AutoUpdater } from './update/auto-updater';
Object.assign(console, log.functions);

const argv = process.argv.slice(1);

// Log configuration
log.transports.file.level = 'debug';
log.log(argv);

// Small optimizations
app.commandLine.appendSwitch('disable-renderer-backgrounding');
ipcMain.setMaxListeners(0);

// Options formatting

const options: any = {
  noHA: false
};

for (let i = 0; i < argv.length; i++) {
  if (argv[i] === '--noHardwareAcceleration' || argv[i] === '-noHA') {
    options.noHA = true;
  }
  if (argv[i] === '--verbose' || argv[i] === '-v') {
    options.verbose = true;
  }
  if (argv[i] === '-pid') {
    options.pid = +argv[i + 1];
  }
}

if (options.noHA) {
  app.disableHardwareAcceleration();
}


//Prepare all the managers
const store = new Store();
const overlayManager = new OverlayManager(store);
const proxyManager = new ProxyManager(store);
const mainWindow = new MainWindow(store, overlayManager, proxyManager);
const pcapManager = new PacketCapture(mainWindow, store, options);
const trayMenu = new TrayMenu(mainWindow, overlayManager, store, pcapManager);
const metrics = new MetricsSystem(mainWindow, store);
const datFilesWatcher = new DatFilesWatcher(mainWindow, store);

// Prepare listeners connector
const ipcListenersManager = new IpcListenersManager(pcapManager, overlayManager, mainWindow, store, trayMenu, proxyManager);

// Let's start everything

// First of all, handle squirrel events and auto updater
const squirrelEventHandler = new SquirrelEventHandler(pcapManager, store);
squirrelEventHandler.handleSquirrelEvent();

const autoUpdater = new AutoUpdater(mainWindow);
autoUpdater.connectListeners();

// Then, create the Electron application
const desktopApp = new TeamcraftDesktopApp(mainWindow, trayMenu, store, pcapManager, argv);
desktopApp.start();

// Then start all our ipc listeners and dat files watcher
ipcListenersManager.init();
datFilesWatcher.start();
metrics.start();
