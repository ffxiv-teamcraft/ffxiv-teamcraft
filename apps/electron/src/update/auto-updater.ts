import { MainWindow } from '../window/main-window';
import log from 'electron-log';
import { app, BrowserWindow, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import { PacketCapture } from '../pcap/packet-capture';


export class AutoUpdater {
  private get win(): BrowserWindow {
    return this.mainWindow.win;
  }

  constructor(private mainWindow: MainWindow, private pcap: PacketCapture) {
  }

  connectListeners(): void {
    // Temporary while testing linux builds with github releases
    // if (app.isPackaged) {
    //   autoUpdater.setFeedURL({ url: 'https://update.ffxivteamcraft.com' });
    // }
    autoUpdater.logger = log;
    autoUpdater.autoInstallOnAppQuit = false;

    let autoUpdaterRunning = false;
    let updateDownloaded = false;

    autoUpdater.on('checking-for-update', () => {
      log.log('Checking for update');
      if (this.win) {
        this.win.webContents.send('checking-for-update');
      }
    });

    autoUpdater.on('update-available', () => {
      log.log('Update available');
      autoUpdaterRunning = false;
    });

    autoUpdater.on('update-not-available', () => {
      log.log('No update found');
      autoUpdaterRunning = false;
      if (this.win) {
        this.win.webContents.send('update-not-available');
      }
    });

    autoUpdater.on('error', (err) => {
      log.log('Updater Error', err);
      autoUpdaterRunning = false;
      if (this.win) {
        this.win.webContents.send('update-not-available');
      }
    });

    autoUpdater.on('update-downloaded', () => {
      log.log('Update downloaded');
      updateDownloaded = true;
      if (this.win) {
        this.win.webContents.send('update-downloaded', false);
      }
    });

    app.on('before-quit', (event) => {
      if (updateDownloaded) {
        updateDownloaded = false;
        event.preventDefault();
        if (this.win) {
          this.win.webContents.send('update-downloaded', true);
        }
      }
    });

    ipcMain.on('install-update', () => {
      (<any>app).isQuitting = true;
      autoUpdater.quitAndInstall();
    });

    ipcMain.on('quit-without-update', () => {
      app.quit();
    });

    ipcMain.on('update:check', () => {
      if (autoUpdaterRunning || !app.isPackaged) {
        return;
      }

      log.log('Run update setup');
      autoUpdaterRunning = true;
      autoUpdater.checkForUpdates();
    });

  }
}
