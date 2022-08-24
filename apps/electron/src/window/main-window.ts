import { app, BrowserWindow, BrowserWindowConstructorOptions, session } from 'electron';
import { Constants } from '../constants';
import { Store } from '../store';
import { OverlayManager } from './overlay-manager';
import { ProxyManager } from '../tools/proxy-manager';
import { Subject } from 'rxjs';

export class MainWindow {

  private _win: BrowserWindow;

  public closed$: Subject<void> = new Subject<void>();

  public get win(): BrowserWindow {
    return this._win;
  }

  public constructor(private store: Store, private overlayManager: OverlayManager, private proxyManager: ProxyManager) {

    app
      .whenReady()
      .then(() => {
        // Modify the user agent for all requests to the following urls.
        const filter = {
          urls: [
            '*://cdn.intergient.com/*',
            '*://securepubads.g.doubleclick.net/*',
            '*://tpc.googlesyndication.com/*', // TODO: Still getting file:// ???
            '*://tpc.googlesyndication.com/*/*',
            '*://tpc.googlesyndication.com/**',
            '*://www.googletagservices.com/*',
            '*://www.googletagservices.com/**'
          ]
        };

        // Before sending headers
        session.defaultSession.webRequest.onBeforeSendHeaders(
          filter,
          (details, callback) => {
            // details.requestHeaders['User-Agent'] = 'MyAgent';
            details.requestHeaders.referrer = 'https://ffxivteamcraft.com/';
            details.requestHeaders.origin = 'https://ffxivteamcraft.com/';

            details.requestHeaders['sec-ch-ua-mobile'] = 'x-client-data';

            details.requestHeaders['sec-ch-ua-mobile'] = '?0';
            details.requestHeaders['sec-ch-ua-platform'] = 'windows';

            details.requestHeaders['sec-ch-ua'] =
              '"Chromium";v="92", " Not A;Brand";v="99", "Google Chrome";v="92"';
            details.referrer = 'https://ffxivteamcraft.com/';
            callback({ requestHeaders: details.requestHeaders });
          }
        );


        session.defaultSession.webRequest.onBeforeRequest((details, callback) => {
          if (details.url.includes('ads') && details.url.includes('url=file')) {
            callback({
              redirectURL: details.url.replace(/url=[^&]+/gm, `url=https://ffxivteamcraft.com`)
            });
          } else {
            callback({});
          }
        });
      });
  }

  public createWindow(deepLink: string = ''): void {
    const opts: BrowserWindowConstructorOptions = {
      show: false,
      backgroundColor: '#2f3237',
      autoHideMenuBar: true,
      frame: true,
      icon: `file://${Constants.BASE_APP_PATH}/assets/app-icon.png`,
      title: 'FFXIV Teamcraft',
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        backgroundThrottling: false
      }
    };
    Object.assign(opts, this.store.get('win:bounds', {}));
    this._win = new BrowserWindow(opts);

    const proxyRule = this.store.get('proxy-rule', '');
    const proxyPac = this.store.get('proxy-pac', '');
    if (proxyRule || proxyPac) {
      this.proxyManager.setProxy(this.win, {
        rule: proxyRule,
        pac: proxyPac
      });
    }

    this.win.loadURL(`file://${Constants.BASE_APP_PATH}/index.html#${deepLink}`);
    this.win.setAlwaysOnTop(this.store.get('win:alwaysOnTop', false), 'normal');


    if (!this.store.get('start-minimized', false)) {
      this.win.show();
    }
    //// uncomment below to open the DevTools.
    // this.win.webContents.openDevTools();

    // Event when the window is closed.
    this.win.on('closed', () => {
      this._win = null;
      try {
        this.overlayManager.forEachOverlay(overlay => {
          if (overlay) {
            overlay.close();
          }
        });
      } catch (e) {
        // Window already destroyed, so we don't care :)
      }

    });

    this.win.on('app-command', (e, cmd) => {
      if (cmd === 'browser-backward' && this.win.webContents.canGoBack()) {
        this.win.webContents.goBack();
      }
      if (cmd === 'browser-forward' && this.win.webContents.canGoForward()) {
        this.win.webContents.goForward();
      }
    });

    // save window size and position
    this.win.on('close', (event) => {
      if (!(<any>app).isQuitting && this.store.get<boolean>('always-quit', true) === false) {
        event.preventDefault();
        this.win.hide();
        return false;
      }
      this.overlayManager.persistOverlays();
      this.store.set('win:bounds', this.win.getBounds());
      this.store.set('win:fullscreen', this.win.isMaximized());
      this.store.set('win:alwaysOnTop', this.win.isAlwaysOnTop());
      this.store.set('win:zoom', this.win.webContents.getZoomFactor());
    });

    this.win.on('minimize', (event) => {
      if (this.store.get<boolean>('enable-minimize-reduction-button', false)) {
        event.preventDefault();
        this.win.hide();
      }
    });

    const handleRedirect = (e, url) => {
      if (url !== this.win.webContents.getURL()) {
        e.preventDefault();
        if (url.indexOf('ffxivteamcraft.com') > -1 || url.indexOf('index.html#') > -1) {
          url = `${url}${url.indexOf('?') > -1 ? '&' : '?'}noDesktop=true`;
        }
        require('electron').shell.openExternal(url);
      }
    };

    this.win.webContents.on('will-navigate', handleRedirect);
    this.win.webContents.on('new-window', handleRedirect);

    (this.store.get('overlays', []) || []).forEach(overlayUri => this.overlayManager.toggleOverlay({ url: overlayUri }));
  }

  public show(): void {
    if (!this.store.get('start-minimized', false)) {
      this.win.focus();
      this.win.show();
      this.win.webContents.setZoomFactor(this.store.get('win:zoom', 1));
      if (this.store.get('win:fullscreen', false)) {
        this.win.maximize();
      }
    }
  }
}
