import { ipcMain } from 'electron';
import { Store } from '../store';
import isDev from 'electron-is-dev';
import { join } from 'path';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import { MainWindow } from '../window/main-window';
import { Database } from 'sqlite3';

export class MetricsSystem {
  private db: Database;

  constructor(private mainWindow: MainWindow, private store: Store) {
    this.mainWindow.closed$.subscribe(() => this.db.close());
  }

  public async start() {
    const APP_DATA = process.env.APPDATA || (process.platform === 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + '/.local/share');
    let METRICS_FOLDER = this.store.get('metrics:folder', join(APP_DATA, `ffxiv-teamcraft-metrics${isDev ? '-dev' : ''}`));

    if (!existsSync(METRICS_FOLDER)) {
      mkdirSync(METRICS_FOLDER);
    }
    this.db = new Database(join(METRICS_FOLDER, `records.db`));
    this.db.serialize(() => {
      this.db.run('CREATE TABLE IF NOT EXISTS records (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,type INTEGER NOT NULL,source INTEGER NOT NULL,data CHAR(256) NOT NULL,timestamp NUMBER);');
    });

    if (!readdirSync(METRICS_FOLDER).includes('.imported')) {
      const files = readdirSync(METRICS_FOLDER);
      const loadedFiles = files.map(fileName => readFileSync(join(METRICS_FOLDER, fileName), 'utf8'));
      loadedFiles.forEach(file => {
        try {
          const parsed = this.parseLogRows(file);
          this.insert(parsed);
        } catch (ignored) {
        }
      });
      writeFileSync(join(METRICS_FOLDER, '.imported'), '1');
    }

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
      this.db.serialize(() => {
        const stmt = this.db.prepare(`SELECT * FROM records WHERE timestamp >= (?) AND timestamp <= (?)`);
        stmt.all([Math.floor(from.getTime() / 1000), Math.floor(to.getTime() / 1000)], (err, rows) => {
          event.sender.send('metrics:loaded', rows.map(row => {
            if (row.data) {
              row.data = JSON.parse(row.data);
            }
            return row;
          }));
        });
        stmt.finalize();
      });
    });
  }

  private insert(data: any[]): void {
    const query = 'INSERT INTO records (type,source,data,timestamp) VALUES (?,?,?,?);';
    const params = data.map(row => {
      return [row.type, row.source, JSON.stringify(row.data), row.timestamp];
    });

    this.db.serialize(() => {
      const stmt = this.db.prepare(query);
      params.forEach(row => stmt.run(row));
      stmt.finalize();
    });
  }

  private parseLogRows(data: string): any[] {
    return data.split('|')
      .map(row => {
        const parsed = row.split(';');
        if (parsed.length === 1) {
          return;
        }
        return {
          timestamp: +parsed[0],
          type: +parsed[1],
          source: +parsed[2],
          data: parsed[3].split(',').map(n => +n)
        };
      })
      .filter(row => {
        return row.source !== undefined;
      });
  }
}
