import { Store } from '../store';
import { BrowserWindow, BrowserWindowConstructorOptions } from 'electron';
import { Constants } from '../constants';
import { join } from 'path';

export class OverlayManager {

  private openedOverlayUris = [];

  private openedOverlays: Record<string, BrowserWindow> = {};

  constructor(private store: Store) {
  }

  toggleOverlay(overlayConfig: { url: string, defaultDimensions?: { x: number, y: number } }) {
    const url = overlayConfig.url;
    if (this.openedOverlays[url]) {
      this.openedOverlays[url].close();
      this.afterOverlayClose(url);
      return;
    }
    const dimensions = overlayConfig.defaultDimensions || { x: 800, y: 600 };
    const opts: BrowserWindowConstructorOptions = {
      title: `FFXIV Teamcraft overlay - ${url}`,
      show: false,
      resizable: true,
      frame: false,
      autoHideMenuBar: true,
      width: dimensions.x,
      height: dimensions.y,
      webPreferences: {
        backgroundThrottling: false,
        preload: join(__dirname, 'src/preload.js')
      }
    };
    Object.assign(opts, this.store.get(`overlay:${url}:bounds`, {}));
    const storedOpacity = this.store.get(`overlay:${url}:opacity`, 1) || 1;
    if (process.platform === 'linux') {
      // setOpacity() is a no-op on Linux. Use a transparent window and control
      // opacity via CSS on the renderer side instead.
      opts.transparent = true;
      opts.backgroundColor = '#00000000';
    } else {
      opts.opacity = storedOpacity;
    }
    const alwaysOnTop = this.store.get(`overlay:${url}:on-top`, true);
    const overlay = new BrowserWindow(opts);
    overlay.setIgnoreMouseEvents(this.store.get('clickthrough', false));

    overlay.once('ready-to-show', () => {
      if (process.platform === 'linux') {
        // Clear the opaque #292929 body background from the ng-zorro theme so
        // that the transparent OS window actually shows the game through. Also
        // pre-apply the stored opacity so there's no full-opacity flash before
        // the Angular component initialises and sets the inline style.
        const opacity = storedOpacity;
        overlay.webContents.insertCSS(
          `html, body { background: transparent !important; }` +
          (opacity < 1 ? ` body { opacity: ${opacity}; }` : '')
        );
      }
      overlay.show();
      // On Linux/X11 the always-on-top hint must be (re-)applied after the
      // window is mapped; doing it before show() is unreliable.
      overlay.setAlwaysOnTop(alwaysOnTop, 'screen-saver');
    });

    // save window size and position
    overlay.on('close', () => {
      this.afterOverlayClose(url);
    });

    overlay.loadURL(`file://${Constants.BASE_APP_PATH}/index.html#${url}?overlay=true`);
    this.openedOverlays[url] = overlay;
    this.openedOverlayUris.push(url);
  }

  afterOverlayClose(url: string) {
    const overlay = this.openedOverlays[url];
    if (!overlay) {
      return;
    }
    this.store.set(`overlay:${url}:bounds`, overlay.getBounds());
    // getOpacity() always returns 1 on Linux, so skip it — the correct value
    // is already in the store (written by the overlay:set-opacity IPC handler).
    if (process.platform !== 'linux') {
      this.store.set(`overlay:${url}:opacity`, overlay.getOpacity());
    }
    this.store.set(`overlay:${url}:on-top`, overlay.isAlwaysOnTop());
    delete this.openedOverlays[url];
    this.openedOverlayUris = this.openedOverlayUris.filter(uri => uri !== url);
  }

  forEachOverlay(cb: (overlay: BrowserWindow) => void): void {
    [].concat.apply([], Object.values(this.openedOverlays))
      .forEach(overlay => {
        cb(overlay);
      });
  }

  sendToOverlay(uri: string, channel: string, payload: any): void {
    if (this.openedOverlays[uri] !== undefined && !this.openedOverlays[uri].isDestroyed()) {
      this.openedOverlays[uri].webContents.send(channel, payload);
    }
  }

  closeOverlay(url: string): void {
    const overlay = this.openedOverlays[url];
    if (!overlay) {
      return;
    }
    overlay.close();
    this.afterOverlayClose(url);
  }

  persistOverlays(): void {
    this.store.set('overlays', this.openedOverlayUris);
  }

  resetOverlayPositions(): void {
    this.forEachOverlay(overlay => overlay.close());
    this.openedOverlayUris = [];
    [
      '/item-search-overlay',
      '/list-panel-overlay',
      '/fishing-reporter-overlay',
      '/alarms-overlay',
      '/list-panel-overlay',
      '/step-by-step-list-overlay',
      '/rotation-overlay',
      '/mappy-overlay'
    ].forEach(uri => {
      this.store.delete(`overlay:${uri}:bounds`);
    });
  }

  getOverlay(url: string): BrowserWindow | undefined {
    return this.openedOverlays[url];
  }
}
