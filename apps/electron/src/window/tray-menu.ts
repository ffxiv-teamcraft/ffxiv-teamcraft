import { Menu, nativeImage, Tray } from 'electron';
import { MainWindow } from './main-window';
import { join } from 'path';
import { Constants } from '../constants';
import { OverlayManager } from './overlay-manager';
import { Store } from '../store';
import { app } from 'electron/main';
import { PacketCapture } from '../pcap/packet-capture';

export class TrayMenu {

  private _tray: Tray;

  public get tray(): Tray {
    return this._tray;
  }

  constructor(private mainWindow: MainWindow, private overlayManager: OverlayManager,
              private store: Store, private pcap: PacketCapture) {
  }

  createTray(): void {
    const iconPath = join(Constants.BASE_APP_PATH, 'assets/app-icon.png');
    const nativeIcon = nativeImage.createFromPath(iconPath);
    const trayIcon = nativeIcon.resize({ width: 16, height: 16 });
    this._tray = new Tray(trayIcon);
    this._tray.on('balloon-click', () => {
      if (this.mainWindow.win === null) {
        this.mainWindow.createWindow();
      }
      if (!this.mainWindow.win.isVisible()) {
        this.mainWindow.win.show();
      }
    });
    this._tray.on('click', () => {
      if (this.mainWindow.win === null) {
        this.mainWindow.createWindow();
      }
      this.mainWindow.win.isVisible() ? this.mainWindow.win.hide() : this.mainWindow.win.show();
    });
    this.mainWindow.win.once('ready-to-show', () => {
      if (this.store.get('start-minimized', false)) {
        this._tray.displayBalloon({
          title: 'Teamcraft launched in the background',
          content: 'To change this behavior, visit Settings -> Desktop.'
        });
      }
    });
    this.mainWindow.win.webContents
      .executeJavaScript('localStorage.getItem("settings") || "{}";', true)
      .then(settingsString => {
        const settings = JSON.parse(settingsString);
        this._tray.setToolTip('FFXIV Teamcraft');
        const contextMenu = Menu.buildFromTemplate([
          {
            label: 'Packet Capture',
            type: 'checkbox',
            checked: this.store.get<boolean>('machina', false),
            click: (menuItem) => {
              this.store.set('machina', menuItem.checked);
              if (menuItem.checked) {
                this.pcap.startPcap();
              } else {
                this.pcap.stop();
              }
            }
          },
          {
            label: 'Overlay',
            type: 'submenu',
            submenu: [
              {
                label: 'Item Search Overlay',
                type: 'normal',
                click: () => {
                  this.overlayManager.toggleOverlay({ url: '/item-search-overlay' });
                }
              },
              {
                label: 'List Overlay',
                type: 'normal',
                click: () => {
                  this.overlayManager.toggleOverlay({ url: '/list-panel-overlay' });
                }
              },
              {
                label: 'Fishing Overlay',
                type: 'normal',
                click: () => {
                  this.overlayManager.toggleOverlay({ url: '/fishing-reporter-overlay' });
                }
              },
              {
                label: 'Alarm Overlay',
                type: 'normal',
                click: () => {
                  this.overlayManager.toggleOverlay({ url: '/alarms-overlay' });
                }
              },
              {
                label: 'Reset overlay positions',
                type: 'normal',
                click: () => {
                  this.overlayManager.resetOverlayPositions();
                }
              },
              {
                label: 'Clickthrough Overlays',
                type: 'checkbox',
                checked: settings.clickthrough === 'true',
                click: (menuItem) => {
                  settings.clickthrough = menuItem.checked.toString();
                  this.store.set('clickthrough', settings.clickthrough === 'true');
                  this.overlayManager.forEachOverlay(overlay => {
                    overlay.setIgnoreMouseEvents(settings.clickthrough === 'true');
                    overlay.webContents.send('update-settings', settings);
                  });
                  this.mainWindow.win.webContents.send('update-settings', settings);
                }
              }
            ]
          },
          {
            label: 'Quit',
            type: 'normal',
            click: () => {
              (<any>app).isQuitting = true;
              app.quit();
            }
          }
        ]);
        this._tray.setContextMenu(contextMenu);
      });
  }
}

