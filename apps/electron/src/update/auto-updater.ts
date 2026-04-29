import { MainWindow } from '../window/main-window';
import log from 'electron-log';
import { app, autoUpdater, BrowserWindow, ipcMain } from 'electron';
import { PacketCapture } from '../pcap/packet-capture';


export class AutoUpdater {
  private get win(): BrowserWindow {
    return this.mainWindow.win;
  }

  constructor(private mainWindow: MainWindow, private pcap: PacketCapture) {
  }

  connectListeners(): void {
    // Squirrel-based autoUpdater is only supported on Windows and macOS
    if (process.platform === 'linux') {
      ipcMain.on('update:check', () => { /* no-op on Linux */ });
      ipcMain.on('install-update', () => { /* no-op on Linux */ });
      return;
    }

    if (app.isPackaged) {
      autoUpdater.setFeedURL({
        url: `https://update.ffxivteamcraft.com`
      });
    }

    let autoUpdaterRunning = false;
    autoUpdater.on('checking-for-update', () => {
      log.log('Checking for update');
      if (this.win) {
        this.win.webContents.send('checking-for-update', true);
      }
    });

    autoUpdater.on('update-available', () => {
      log.log('Update available');
      if (this.win) {
        this.win.webContents.send('update-available', true);
      }
    });

    autoUpdater.on('update-not-available', () => {
      log.log('No update found');
      autoUpdaterRunning = false;
      if (this.win) {
        this.win.webContents.send('update-available', false);
      }
    });

    autoUpdater.on('error', (err) => {
      log.log('Updater Error', err);
      autoUpdaterRunning = false;
      if (this.win) {
        this.win.webContents.send('update-available', false);
      }
    });

    autoUpdater.on('update-downloaded', () => {
      log.log('Update downloaded');
      autoUpdaterRunning = false;
      if (this.win) {
        this.win.webContents.send('update-downloaded');
      }
    });

    ipcMain.on('install-update', () => {
      (<any>app).isQuitting = true;
      autoUpdater.quitAndInstall();
    });


    ipcMain.on('update:check', () => {
      if (autoUpdaterRunning) {
        return;
      }

      log.log('Run update setup');
      autoUpdaterRunning = true;
      autoUpdater.checkForUpdates();
    });

  }
}
