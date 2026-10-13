import { app, BrowserWindow, ipcMain, protocol, session } from 'electron';
import { createServer as createHttpServer, Server } from 'http';
import { MainWindow } from './window/main-window';
import { TrayMenu } from './window/tray-menu';
import { Store } from './store';
import { PacketCapture } from './pcap/packet-capture';
import log from 'electron-log';
import { Constants } from './constants';
import { join } from 'path';
import { parse, pathToFileURL } from 'url';
import { MetricsSystem } from './ipc/metrics-system';
import { toAppRoute } from './tools/deep-link';

export class TeamcraftDesktopApp {

  // OAuth providers redirect to http://localhost:14500/oauth (registered redirect URI).
  private static readonly OAUTH_PORT = 14500;

  private static readonly OAUTH_TIMEOUT = 10 * 60 * 1000;

  private oauthServer: Server | null = null;

  private oauthServerTimeout: ReturnType<typeof setTimeout>;

  private booted = false;

  public constructor(private mainWindow: MainWindow, private tray: TrayMenu, private store: Store,
                     private pcap: PacketCapture, private metrics: MetricsSystem, private argv: any[]) {
  }

  start(): void {
    app.setAsDefaultProtocolClient('teamcraft');

    // A second launch (e.g. opening a teamcraft:// link) hands its link to the running instance and quits.
    if (!app.requestSingleInstanceLock()) {
      (<any>app).isQuitting = true;
      app.quit();
      process.exit(0);
      return;
    }

    let deepLink = '';

    app.on('second-instance', (event, argv) => {
      this.openDeepLink(this.getDeepLinkFromArgv(argv));
    });

    // macOS delivers protocol links through open-url instead of a second instance.
    app.on('open-url', (event, url) => {
      event.preventDefault();
      this.openDeepLink(toAppRoute(url));
    });

    ipcMain.on('oauth:start', () => {
      this.startOauthServer();
    });

    app.whenReady().then(() => {
      session.defaultSession
        .setPermissionRequestHandler((webContents, permission, callback) => {
          const parsedUrl = new URL(webContents.getURL());

          if (permission === 'notifications') {
            // Approves the permissions request
            callback(true);
          }

          // Verify URL
          if (parsedUrl.protocol !== 'file:') {
            // Denies the permissions request
            return callback(false);
          }
        });


      protocol.handle('teamcraft', (req) => {
        deepLink = toAppRoute(req.url);
        return new Response('OK');
      });
      if (process.platform === 'win32' && process.argv.slice(1).toString().indexOf('--') === -1 && process.argv.slice(1).toString().indexOf('.js') === -1) {
        deepLink = this.getDeepLinkFromArgv(process.argv.slice(1));
        if (!deepLink) {
          deepLink = this.store.get('router:uri', '');
        }
      } else {
        deepLink = this.store.get('router:uri', '');
      }
      // It seems like somehow, this could happen.
      if (deepLink.indexOf('overlay') > -1 || deepLink.indexOf('?child') > -1) {
        deepLink = '';
      }

      this.bootApp(deepLink);
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

    app.on('before-quit', () => {
      this.stopOauthServer();
      // Keeps the previous quit behavior, where the process exited once the always-on local server closed.
      if (this.booted) {
        setImmediate(() => process.exit(0));
      }
    });
  }

  private getDeepLinkFromArgv(argv: string[]): string {
    const link = argv.find(arg => /^teamcraft:/i.test(arg));
    return link ? toAppRoute(link) : '';
  }

  private openDeepLink(route: string): void {
    const win = this.mainWindow.win;
    if (!win || win.isDestroyed()) {
      return;
    }
    if (win.isMinimized()) {
      win.restore();
    }
    win.show();
    win.focus();
    if (route) {
      win.webContents.send('navigate', route);
    }
  }

  /**
   * Listens for the OAuth redirect of a login started in the app, until it arrives or times out.
   * Nothing listens on the port otherwise, so web pages can't reach the app through it.
   */
  private startOauthServer(): void {
    this.stopOauthServer();
    const server = createHttpServer((req, res) => {
      const { pathname, query } = parse(req.url || '', true);
      if (req.method !== 'GET' || pathname !== '/oauth') {
        res.writeHead(404);
        res.end();
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end('<script>window.close();</script>You can now close this tab.');
      if (typeof query.code === 'string' && query.code.length > 0) {
        this.mainWindow.win.webContents.send('oauth-reply', query.code);
        this.mainWindow.win.show();
        this.mainWindow.win.focus();
        this.stopOauthServer();
      }
    });
    server.on('error', error => log.error('OAuth callback server error', error));
    server.listen(TeamcraftDesktopApp.OAUTH_PORT, 'localhost');
    this.oauthServer = server;
    this.oauthServerTimeout = setTimeout(() => this.stopOauthServer(), TeamcraftDesktopApp.OAUTH_TIMEOUT);
  }

  private stopOauthServer(): void {
    clearTimeout(this.oauthServerTimeout);
    if (this.oauthServer) {
      this.oauthServer.close();
      this.oauthServer = null;
    }
  }

  private bootApp(deepLink = ''): void {
    this.booted = true;
    const loaderWindow = new BrowserWindow({
      width: 400,
      height: 500,
      show: false,
      frame: false,
      backgroundColor: '#2f3237',
      icon: join(Constants.BASE_APP_PATH, 'assets', 'app-icon.png'),
      webPreferences: {
        preload: join(__dirname, 'src/preload.js')
      }
    });

    loaderWindow.once('ready-to-show', () => {
      loaderWindow.show();
      this.mainWindow.createWindow();
      this.tray.createTray();

      ipcMain.once('app-ready', () => {
        if (deepLink.length > 0 && !this.store.get('disable-initial-navigation', false)) {
          this.mainWindow.win.webContents.send('navigate', deepLink.replace('?child=true', ''));
        }
        if (this.store.get<boolean>('machina', false) === true) {
          this.pcap.startPcap();
        }
        loaderWindow.hide();
        loaderWindow.close();
        this.mainWindow.show();
        setTimeout(() => {
          this.mainWindow.win.focus();
          this.mainWindow.win.webContents.send('displayed', true);
        }, 200);
        this.metrics.start();
      });
    });

    const resolveHtmlPath = (htmlFileName: string): string => {
      return pathToFileURL(join(__dirname, htmlFileName)).href;
    };

    loaderWindow.loadURL(resolveHtmlPath('loader.html'));
  }
}
