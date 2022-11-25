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
        preload: join(__dirname, '../preload.js')
      }
    };
    Object.assign(opts, this.store.get(`overlay:${url}:bounds`, {}));
    opts.opacity = this.store.get(`overlay:${url}:opacity`, 1) || 1;
    const alwaysOnTop = this.store.get(`overlay:${url}:on-top`, true);
    const overlay = new BrowserWindow(opts);
    overlay.setAlwaysOnTop(alwaysOnTop, 'screen-saver');
    overlay.setIgnoreMouseEvents(this.store.get('clickthrough', false));

    overlay.once('ready-to-show', () => {
      overlay.show();
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
    this.store.set(`overlay:${url}:opacity`, overlay.getOpacity());
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
