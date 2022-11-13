import { ipcMain } from 'electron';
import { Store } from '../store';
import isDev from 'electron-is-dev';
import { join } from 'path';
import { existsSync, mkdirSync, readdirSync, readFileSync } from 'fs';
import { MainWindow } from '../window/main-window';

export class MetricsSystem {
  constructor(private mainWindow: MainWindow, private store: Store) {
  }

  public async start() {
    const APP_DATA = process.env.APPDATA || (process.platform === 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + '/.local/share');
    let METRICS_FOLDER = this.store.get('metrics:folder', join(APP_DATA, `ffxiv-teamcraft-metrics${isDev ? '-dev' : ''}`));

    if (!existsSync(METRICS_FOLDER)) {
      mkdirSync(METRICS_FOLDER);
    }
    // await sqlite.setdbPath(join(APP_DATA, `ffxiv-teamcraft-metrics${isDev ? '-dev' : ''}`, 'records.db'));
    // await sqlite.executeScript('CREATE TABLE IF NOT EXISTS records (ID INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,TYPE INTEGER NOT NULL,SOURCE INTEGER NOT NULL,DATA CHAR(256) NOT NULL,TIMESTAMP NUMBER);');

    console.log(readdirSync(METRICS_FOLDER));

    ipcMain.on('metrics:persist', (event, data) => {
      if (data.length === 0) {
        return;
      }
      this.insert(data);
    });

    ipcMain.on('metrics:load', (event, { from, to }) => {
      if (to === undefined) {
        to = Date.now();
      }
      // TODO convert to sqlite
      const files = readdirSync(METRICS_FOLDER);
      const loadedFiles = files
        .filter(fileName => {
          const date = +fileName.split('.')[0];
          return date >= from && date <= to;
        })
        .map(fileName => readFileSync(join(METRICS_FOLDER, fileName), 'utf8'));
      event.sender.send('metrics:loaded', loadedFiles);
    });
  }

  private insert(data: any[]): void {
    const query = 'INSERT INTO records (TYPE,SOURCE,DATA,TIMESTAMP) VALUES (?,?,?,?);';
    const params = data.map(row => {
      return [row.type, row.source, JSON.stringify(row.data), row.timestamp];
    });

    console.log(query, params);
    // TODO run the query once https://github.com/tmotagam/sqlite-electron/issues/9 is fixed
  }
}
