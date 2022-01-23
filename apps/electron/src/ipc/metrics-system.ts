import { dialog, ipcMain, OpenDialogOptions } from 'electron';
import { Store } from '../store';
import isDev from 'electron-is-dev';
import { join } from 'path';
import { appendFileSync, existsSync, mkdirSync, readdirSync, readFileSync } from 'fs';
import { moveSync } from 'fs-extra';
import { MainWindow } from '../window/main-window';

export class MetricsSystem {
  constructor(private mainWindow: MainWindow, private store: Store) {
  }

  public start(): void {
    const APP_DATA = process.env.APPDATA || (process.platform === 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + '/.local/share');
    let METRICS_FOLDER = this.store.get('metrics:folder', join(APP_DATA, `ffxiv-teamcraft-metrics${isDev ? '-dev' : ''}`));

    if (!existsSync(METRICS_FOLDER)) {
      mkdirSync(METRICS_FOLDER);
    }

    ipcMain.on('metrics:persist', (event, data) => {
      if (data.length === 0) {
        return;
      }
      const now = new Date();
      let month = now.getMonth().toString();
      if (+month < 10) {
        month = `0${month}`;
      }
      let day = now.getUTCDate().toString();
      if (+day < 10) {
        day = `0${day}`;
      }
      const filename = `${now.getFullYear()}${month}${day}.tcmetrics`;
      const filePath = join(METRICS_FOLDER, filename);
      if (existsSync(filePath)) {
        data = `|${data}`;
      }
      appendFileSync(filePath, data);
    });

    ipcMain.on('metrics:load', (event, { from, to }) => {
      if (to === undefined) {
        to = Date.now();
      }
      const files = readdirSync(METRICS_FOLDER);
      const loadedFiles = files
        .filter(fileName => {
          const date = +fileName.split('.')[0];
          return date >= from && date <= to;
        })
        .map(fileName => readFileSync(join(METRICS_FOLDER, fileName), 'utf8'));
      event.sender.send('metrics:loaded', loadedFiles);
    });

    ipcMain.on('metrics:path:get', (event) => {
      event.sender.send('metrics:path:value', METRICS_FOLDER);
    });

    ipcMain.on('metrics:path:set', (event, value) => {
      const folderPickerOptions: OpenDialogOptions = {
        // See place holder 2 in above image
        defaultPath: METRICS_FOLDER,
        properties: ['openDirectory']
      };
      dialog.showOpenDialog(this.mainWindow.win, folderPickerOptions).then((result) => {
        if (result.canceled) {
          return;
        }
        const filePath = result.filePaths[0];
        moveSync(METRICS_FOLDER, filePath);
        METRICS_FOLDER = filePath;
        this.store.set('metrics:folder', filePath);
        event.sender.send('metrics:path:value', METRICS_FOLDER);
      });
    });
  }
}
