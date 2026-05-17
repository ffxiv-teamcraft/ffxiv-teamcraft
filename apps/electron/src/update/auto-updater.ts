import { MainWindow } from '../window/main-window';
import log from 'electron-log';
import { app, autoUpdater as squirrelUpdater, BrowserWindow, ipcMain } from 'electron';
import { autoUpdater as linuxUpdater } from 'electron-updater';


export class AutoUpdater {
  private get win(): BrowserWindow {
    return this.mainWindow.win;
  }

  constructor(private mainWindow: MainWindow) {
  }

  connectListeners(): void {
    const isLinux = process.platform === 'linux';
    const updater: any = isLinux ? linuxUpdater : squirrelUpdater;

    if (isLinux) {
      linuxUpdater.logger = log;
      linuxUpdater.autoInstallOnAppQuit = false;
    }

    if (!isLinux && app.isPackaged) {
      squirrelUpdater.setFeedURL({ url: 'https://update.ffxivteamcraft.com' });
    }

    let autoUpdaterRunning = false;
    let updateDownloaded = false;

    updater.on('checking-for-update', () => {
      log.log('Checking for update');
      if (this.win) {
        this.win.webContents.send('checking-for-update');
      }
    });

    updater.on('update-available', () => {
      log.log('Update available');
      autoUpdaterRunning = false;
      if (this.win) {
        this.win.webContents.send('update-available');
      }
    });

    updater.on('update-not-available', () => {
      log.log('No update found');
      autoUpdaterRunning = false;
      if (this.win) {
        this.win.webContents.send('update-not-available');
      }
    });

    updater.on('error', (err) => {
      log.log('Updater Error', err);
      autoUpdaterRunning = false;
      if (this.win) {
        this.win.webContents.send('update-not-available');
      }
    });

    updater.on('update-downloaded', () => {
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
      updater.quitAndInstall();
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
      updater.checkForUpdates();
    });

  }
}
