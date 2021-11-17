import { app, BrowserWindow, ipcMain, protocol } from 'electron';
import { createServer } from 'net';
import { createServer as createHttpServer, Server } from 'http';
import * as request from 'request';
import { MainWindow } from './window/main-window';
import { TrayMenu } from './window/tray-menu';
import { Store } from './store';
import { PacketCapture } from './pcap/packet-capture';
import * as log from 'electron-log';
import { Constants } from './constants';
import { join } from 'path';

export class TeamcraftDesktopApp {

  private static readonly MAIN_WINDOW_PORT = 14500;

  private httpServer: Server;

  public constructor(private mainWindow: MainWindow, private tray: TrayMenu, private store: Store,
                     private pcap: PacketCapture, private argv: any[]) {
  }

  start(): void {
    // app.releaseSingleInstanceLock();
    app.setAsDefaultProtocolClient('teamcraft');
    let deepLink = this.store.get('deepLink', '');

    app.whenReady().then(() => {
      protocol.registerFileProtocol('teamcraft', (req) => {
        deepLink = req.url.substr(12);
        if (deepLink.endsWith('/')) {
          log.info(`Opening from File protocol: `, deepLink);
          deepLink = deepLink.substr(0, deepLink.length - 1);
        }
      });
      if (process.platform === 'win32' && process.argv.slice(1).toString().indexOf('--') === -1 && process.argv.slice(1).toString().indexOf('.js') === -1) {
        log.info(`Opening from argv : `, process.argv.slice(1));
        deepLink = process.argv.slice(1).toString().substr(12);
      } else {
        deepLink = this.store.get('router:uri', '');
      }
      // It seems like somehow, this could happen.
      if (deepLink.indexOf('overlay') > -1) {
        deepLink = '';
      }

      request(`http://localhost:${TeamcraftDesktopApp.MAIN_WINDOW_PORT}${(this.argv[0] || '').replace('teamcraft://', '')}`, (err, res) => {
        if(err){
          this.bootApp()
        } else {
          (<any>app).isQuitting = true;
          app.quit();
          process.exit(0);
        }
      });
    });

    // Quit when all windows are closed.
    app.on('window-all-closed', () => {
      // On macOS specific close process
      if (process.platform !== 'darwin') {
        (<any>app).isQuitting = true;
        app.quit();
      }
    });

    app.on('activate', () => {
      // macOS specific close process
      if (this.mainWindow.win === null) {
        this.mainWindow.createWindow(deepLink);
      }
    });

    this.mainWindow.closed$.subscribe(() => {
      this.store.set('router:uri', deepLink);
    });
  }

  private bootApp(): void {
    const loaderWindow = new BrowserWindow({
      width: 400,
      height: 500,
      show: false,
      frame: false,
      backgroundColor: '#2f3237',
      icon: `file://${Constants.BASE_APP_PATH}/assets/app-icon.png`,
      webPreferences: {
        contextIsolation: false
      }
    });

    loaderWindow.once('show', () => {
      this.mainWindow.createWindow();
      this.tray.createTray();
      this.httpServer = createHttpServer((req, res) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Request-Method', '*');
        res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
        res.setHeader('Access-Control-Allow-Headers', '*');
        if (req.method === 'OPTIONS') {
          res.writeHead(200);
          res.end();
          return;
        }
        this.mainWindow.win.focus();
        this.mainWindow.win.show();
        console.log(req.url);
        if (req.url.length > 1) {
          console.log('SENDING URL TO MAIN');
          this.mainWindow.win.webContents.send('navigate', req.url);
        }
        res.writeHead(200);
        res.end();
      }).listen(TeamcraftDesktopApp.MAIN_WINDOW_PORT, 'localhost');

      ipcMain.once('app-ready', () => {
        if (this.store.get<boolean>('machina', false) === true) {
          this.pcap.start();
        }
        loaderWindow.hide();
        loaderWindow.close();
        this.mainWindow.show();
        setTimeout(() => {
          this.mainWindow.win.focus();
          this.mainWindow.win.webContents.send('displayed', true);
        }, 200);
      });
    });

    loaderWindow.loadURL(join(__dirname, 'loader.html'));
    loaderWindow.show();
  }
}
