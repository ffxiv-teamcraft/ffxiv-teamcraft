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
import { app, ipcMain, protocol } from 'electron';

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
const trayMenu = new TrayMenu(mainWindow, overlayManager, store);
const pcapManager = new PacketCapture(mainWindow, store, options);

// Prepare listeners connector
const ipcListenersManager = new IpcListenersManager(pcapManager, overlayManager, mainWindow, store, trayMenu, proxyManager);

// Let's start everything

// First of all, handle squirrel events
const squirrelEventHandler = new SquirrelEventHandler(pcapManager, store);
squirrelEventHandler.handleSquirrelEvent();

// Then, create the Electron application
const desktopApp = new TeamcraftDesktopApp(mainWindow, trayMenu, store, pcapManager, argv);
desktopApp.start();

// Then start all our ipc listeners
ipcListenersManager.init();
