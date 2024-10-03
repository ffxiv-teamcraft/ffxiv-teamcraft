import { app, BrowserWindow, BrowserWindowConstructorOptions, session } from 'electron';
import { Constants } from '../constants';
import { Store } from '../store';
import { OverlayManager } from './overlay-manager';
import { ProxyManager } from '../tools/proxy-manager';
import { Subject } from 'rxjs';
import { join } from 'path';

export class MainWindow {

  private _win: BrowserWindow;

  public closed$: Subject<void> = new Subject<void>();

  private childWindows: Record<string, BrowserWindow> = {};

  public get win(): BrowserWindow {
    return this._win;
  }

  public constructor(private store: Store, private overlayManager: OverlayManager, private proxyManager: ProxyManager) {
  }

  public forEachChildWindow(fn: (win: BrowserWindow) => void): void {
    Object.values(this.childWindows)
      .filter(win => win && !win.isDestroyed())
      .forEach(fn);
  }

  private initWindow(title: string, deepLink = ''): BrowserWindow {
    const opts: BrowserWindowConstructorOptions = {
      show: false,
      backgroundColor: '#2f3237',
      autoHideMenuBar: true,
      frame: true,
      icon: `file://${Constants.BASE_APP_PATH}/assets/app-icon.png`,
      title: title,
      webPreferences: {
        backgroundThrottling: false,
        sandbox: true,
        preload: join(__dirname, './src/preload.js')
      }
    };
    Object.assign(opts, this.store.get('win:bounds', {}));
    const win = new BrowserWindow(opts);
    const proxyRule = this.store.get('proxy-rule', '');
    const proxyPac = this.store.get('proxy-pac', '');
    if (proxyRule || proxyPac) {
      this.proxyManager.setProxy(win, {
        rule: proxyRule,
        pac: proxyPac
      });
    }

    win.loadURL(`file://${Constants.BASE_APP_PATH}/index.html#${deepLink}`);

    win.on('app-command', (e, cmd) => {
      if (cmd === 'browser-backward' && win.webContents.canGoBack()) {
        win.webContents.goBack();
      }
      if (cmd === 'browser-forward' && win.webContents.canGoForward()) {
        win.webContents.goForward();
      }
    });

    const handleRedirect = (e, url: string) => {
      if (url !== win.webContents.getURL()) {
        e.preventDefault();
        if (url.includes('ffxivteamcraft.com') || url.includes('index.html#')) {
          url = `${url}${url.indexOf('?') > -1 ? '&' : '?'}noDesktop=true`;
        }
        require('electron').shell.openExternal(url);
      }
    };

    win.webContents.on('will-navigate', handleRedirect);
    win.webContents.setWindowOpenHandler(details => {
      let url = details.url;
      if (url.startsWith('https://ffxivteamcraft.com') || url.includes('index.html#')) {
        this.createChildWindow(url.split('#')[1]);
      } else {
        require('electron').shell.openExternal(url);
      }
      return { action: 'deny' };
    });

    return win;
  }

  public whenReady(): void {
    // Modify the user agent for all requests to the following urls.
    const filter = {
      urls: [
        '*://cdn.intergient.com/*',
        '*://securepubads.g.doubleclick.net/*',
        '*://tpc.googlesyndication.com/*',
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
      // We have to store the url because we're only allowed to call the callback once, so we're gonna edit
      let url: string = details.url;
      // First, let's handle request protocol
      if (url.match(/^file:\/\/[^.\/]*\.[^\/]+\/.+$/mi)) {
        url = url.replace('file://', 'https://');
      }
      // Then, ads request url details containing file protocol
      if (url.includes('ads?') && url.includes('url=file')) {
        url = url.replace(/url=file[^&]+/gm, `url=https://ffxivteamcraft.com`);
      }
      // If there's a redirect to do, do it !
      if (url !== details.url) {
        callback({
          redirectURL: url
        });
      } else {
        callback({});
      }
    });

    session.defaultSession.setDevicePermissionHandler(() => false);
    session.defaultSession.setPermissionRequestHandler((_, permission, callback, details) => {
      console.log('REQ', permission, details);
      callback(permission !== 'media');
    });
  }

  public createWindow(deepLink: string = ''): void {
    // Make sure we don't keep child flag on main win by mistake !
    this._win = this.initWindow('FFXIV Teamcraft - Main Window', deepLink.replace('?child=true', ''));

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

    // save window size and position
    this.win.on('close', (event) => {
      if (!(<any>app).isQuitting && this.store.get<boolean>('always-quit', true) === false) {
        event.preventDefault();
        this.win.hide();
        return false;
      }
      this.overlayManager.persistOverlays();
      Object.values(this.childWindows).forEach(win => {
        if (win) {
          win.close();
          win.destroy();
        }
      });
      this.store.set('win:bounds', this.win.getBounds());
      this.store.set('win:fullscreen', this.win.isMaximized());
      this.store.set('win:alwaysOnTop', this.win.isAlwaysOnTop());
      this.store.set('win:zoom', this.win.webContents.getZoomFactor());
    });

    this.win.on('page-title-updated', (event, title) => {
      setTimeout(() => this.win.setTitle(`${title} - Main Window`));
    });

    this.win.on('minimize', (event) => {
      if (this.store.get<boolean>('enable-minimize-reduction-button', false)) {
        event.preventDefault();
        this.win.hide();
      }
    });

    (this.store.get('overlays', []) || []).forEach(overlayUri => this.overlayManager.toggleOverlay({ url: overlayUri }));
  }

  public createChildWindow(deepLink: string): void {
    if (!this.childWindows[deepLink]) {
      const win = this.initWindow('FFXIV Teamcraft', `${deepLink}?child=true`);
      win.once('ready-to-show', () => {
        win.show();
        win.focus();
        win.webContents.send('displayed', true);
      });
      win.webContents.ipc.on('toggle-pcap:get', e => {
        e.sender.send('toggle-pcap:value', false);
      });
      win.on('closed', () => delete this.childWindows[deepLink]);
      this.childWindows[deepLink] = win;
    } else {
      this.childWindows[deepLink].focus();
    }
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
