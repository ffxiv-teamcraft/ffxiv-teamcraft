import { app, ipcMain, nativeImage, shell } from 'electron';
import log from 'electron-log';
import { Oauth } from '../oauth/oauth';
import { PacketCapture } from '../pcap/packet-capture';
import { Store } from '../store';
import { MainWindow } from '../window/main-window';
import { OverlayManager } from '../window/overlay-manager';
import { join } from 'path';
import { Constants } from '../constants';
import { TrayMenu } from '../window/tray-menu';
import { exec } from 'child_process';
import isDev from 'electron-is-dev';
import { ProxyManager } from '../tools/proxy-manager';
import { existsSync, readFile, writeFileSync } from 'fs';
import { createFileSync, readFileSync } from 'fs-extra';
import { Character, CharacterSearch } from '@xivapi/nodestone';
import { Worker } from 'worker_threads';
import ua from 'universal-analytics';
import { v4 as uuidv4 } from 'uuid';
import fetch from 'electron-fetch';


export class IpcListenersManager {

  private mappyState: any = {};

  private appState: any = {};

  private fishingState: any = {};

  private characterSearchParser = new CharacterSearch();

  private characterParser = new Character();

  constructor(private pcap: PacketCapture, private overlayManager: OverlayManager,
              private mainWindow: MainWindow, private store: Store,
              private trayMenu: TrayMenu, private proxyManager: ProxyManager) {
  }

  private twoWayBinding(event: string, storeFieldName: string, onWrite?: (value) => void, defaultValue?: any) {
    ipcMain.on(event, (e, value) => {
      this.store.set(storeFieldName, value);
      if (onWrite) {
        onWrite(value);
      }
      e.sender.send(`${event}:value`, value);
    });

    ipcMain.on(`${event}:get`, (e) => {
      e.sender.send(`${event}:value`, this.store.get(storeFieldName, defaultValue));
    });
  }

  public init(): void {
    this.setupLodestoneListeners();
    this.setupOauthListeners();
    this.setupOverlayListeners();
    this.setupStateListeners();
    this.setupSettingsListeners();
    this.setupToolingListeners();
    this.setupProxyManagerListeners();
    this.setupInventoryListeners();
    this.setupFreeCompanyWorkshopsListeners();

    this.setupAnalyticsListeners();
  }

  private setupOauthListeners(): void {
    ipcMain.on('oauth', (event, providerId) => {
      if (providerId === 'google.com') {
        const provider = {
          authorize_url: 'https://accounts.google.com/o/oauth2/auth',
          client_id: '1082504004791-qjnubk6kj80kfvn3mg86lmu6eba16c6l.apps.googleusercontent.com',
          redirect_uri: 'http://localhost'
        };
        new Oauth(provider).getCode({ scope: 'https://www.googleapis.com/auth/userinfo.profile' }).then(code => {
          event.sender.send('oauth-reply', code);
        });
      }
      if (providerId === 'discordapp.com') {
        const provider = {
          authorize_url: 'https://discordapp.com/api/oauth2/authorize',
          client_id: '514350168678727681',
          redirect_uri: 'http://localhost'
        };
        new Oauth(provider).getCode({ scope: 'webhook.incoming' }).then(code => {
          event.sender.send('oauth-reply', code);
        });
      }
      if (providerId === 'patreon.com') {
        const provider = {
          authorize_url: 'https://www.patreon.com/oauth2/authorize',
          client_id: 'MMmud8pCDGgQkhd8H2g_SpRWgzvCYwyawjSqmvjl_pjOA7Yco6Cp-Ljv8InmGMUE',
          redirect_uri: 'http://localhost'
        };
        new Oauth(provider).getCode({ scope: 'identity' }).then(code => {
          event.sender.send('oauth-reply', code);
        });
      }
    });
  }

  private setupOverlayListeners(): void {
    ipcMain.on('overlay', (event, data) => {
      this.overlayManager.toggleOverlay(data);
    });

    ipcMain.on('overlay:set-opacity', (event, data) => {
      const overlayWindow = this.overlayManager.getOverlay(data.uri);
      if (overlayWindow !== undefined && overlayWindow) {
        overlayWindow.setOpacity(data.opacity);
      }
    });

    ipcMain.on('overlay:open-page', (event, data) => {
      this.mainWindow.win.webContents.send('navigate', data);
      this.mainWindow.win.focus();
    });

    ipcMain.on('overlay:get-opacity', (event, data) => {
      const overlayWindow = this.overlayManager.getOverlay(data.uri);
      if (overlayWindow !== undefined) {
        event.sender.send(`overlay:${data.uri}:opacity`, overlayWindow.getOpacity());
      }
    });

    ipcMain.on('overlay:set-on-top', (event, data) => {
      const overlayWindow = this.overlayManager.getOverlay(data.uri);
      if (overlayWindow !== undefined) {
        overlayWindow.setAlwaysOnTop(data.onTop, 'screen-saver');
      }
    });

    ipcMain.on('overlay:get-on-top', (event, data) => {
      const overlayWindow = this.overlayManager.getOverlay(data.uri);
      if (overlayWindow !== undefined) {
        event.sender.send(`overlay:${data.uri}:on-top`, overlayWindow.isAlwaysOnTop());
      }
    });

    ipcMain.on('overlay-close', (event, url) => {
      const overlay = this.overlayManager.getOverlay(url);
      if (overlay) {
        overlay.close();
      }
    });
  }

  private setupStateListeners(): void {
    const overlaysNeedingFishingState = [
      '/fishing-reporter-overlay'
    ];
    const overlaysNeedingState = [
      '/list-panel-overlay'
    ];

    ipcMain.on('fishing-state:set', (_, data) => {
      this.fishingState = data;
      overlaysNeedingFishingState.forEach(uri => {
        this.overlayManager.sendToOverlay(uri, 'fishing-state', data);
      });
    });

    ipcMain.on('fishing-state:get', (event) => {
      event.sender.send('fishing-state', this.fishingState);
    });

    ipcMain.on('mappy-state:set', (_, data) => {
      this.mappyState = data;
      this.overlayManager.sendToOverlay('/mappy-overlay', 'mappy-state', data);
    });

    ipcMain.on('mappy-state:get', (event) => {
      event.sender.send('mappy-state', this.mappyState);
    });

    ipcMain.on('mappy:reload', (event) => {
      this.mainWindow.win.webContents.send('mappy:reload');
    });

    ipcMain.on('app-state:set', (_, data) => {
      this.appState = data;
      overlaysNeedingState.forEach(uri => {
        this.overlayManager.sendToOverlay(uri, 'app-state', data);
      });
    });

    ipcMain.on('app-state:get', (event) => {
      event.sender.send('app-state', this.appState);
    });

    const fishingDumpPath = join(app.getPath('userData'), 'fishingresults.json');

    ipcMain.on('fishing-report', (event, data) => {
      if (!existsSync(fishingDumpPath)) {
        createFileSync(fishingDumpPath);
      }
      const fishingDump = readFileSync(fishingDumpPath, 'utf8') || '[]';
      writeFileSync(fishingDumpPath, JSON.stringify([...JSON.parse(fishingDump), ...data]));
    });

  }

  private setupSettingsListeners(): void {
    ipcMain.on('apply-settings', (event, settings) => {
      try {
        if (settings.region && this.store.get('region', 'Global') !== settings.region) {
          this.store.set('region', settings.region);

          if (this.store.get<boolean>('machina', false) === true) {
            this.pcap.stop();
            this.pcap.start();
          }
        }

        this.overlayManager.forEachOverlay(overlay => {
          overlay.setIgnoreMouseEvents(settings.clickthrough === 'true');
          overlay.webContents.send('update-settings', settings);
        });
        this.mainWindow.win.webContents.send('update-settings', settings);
      } catch (e) {
        // Window already destroyed, so we don't care :)
        console.error(e);
      }
    });

    this.twoWayBinding('toggle-machina', 'machina', enabled => {
      if (enabled) {
        this.pcap.start();
      } else {
        this.pcap.stop();
      }
    });

    this.twoWayBinding('rawsock', 'rawsock', () => {
      this.pcap.stop();
      this.pcap.start();
    });

    this.twoWayBinding('always-on-top', 'win:alwaysOnTop', (onTop) => {
      this.mainWindow.win.setAlwaysOnTop(onTop, 'normal');
    });

    this.twoWayBinding('disable-initial-navigation', 'disable-initial-navigation');
    this.twoWayBinding('no-shortcut', 'setup:noShortcut');
    this.twoWayBinding('start-minimized', 'start-minimized');
    this.twoWayBinding('always-quit', 'always-quit', null, true);
    this.twoWayBinding('enable-minimize-reduction-button', 'enable-minimize-reduction-button');

    ipcMain.on('fullscreen-toggle', () => {
      if (this.mainWindow.win.isMaximized()) {
        this.mainWindow.win.unmaximize();
      } else {
        this.mainWindow.win.maximize();
      }
    });

    ipcMain.on('minimize', () => {
      this.mainWindow.win.minimize();
    });

    ipcMain.on('language', (event, lang) => {
      try {
        this.overlayManager.forEachOverlay(overlay => {
          overlay.webContents.send('apply-language', lang);
        });
      } catch (e) {
        // Window already destroyed, so we don't care :)
      }
    });
  }

  private setupToolingListeners(): void {
    ipcMain.on('machina:firewall:set-rule', (event) => {
      this.pcap.addMachinaFirewallRule();
      event.sender.send('machina:firewall:rule-set', true);
    });

    ipcMain.on('show-devtools', () => {
      this.mainWindow.win.webContents.openDevTools();
    });

    ipcMain.on('open-link', (event, url) => {
      shell.openExternal(url);
    });

    ipcMain.on('log', (event, entry) => {
      log.log(entry);
    });

    ipcMain.on('notification', (event, config) => {
      const iconPath = join(Constants.BASE_APP_PATH, 'assets/app-icon.png');
      // Override icon for now, as getting the icon from url doesn't seem to be working properly.
      config.icon = nativeImage.createFromPath(iconPath);
      config.silent = true;
      this.trayMenu.tray.displayBalloon(config);
    });

    ipcMain.on('clear-cache', () => {
      this.mainWindow.win.webContents.session.clearStorageData().then(() => {
        app.relaunch();
        app.exit();
      });
    });

    ipcMain.on('navigated', (event, uri) => {
      if (uri.length > 1) {
        this.store.set('router:uri', uri);
      }
    });

    ipcMain.on('zoom-in', () => {
      const currentzoom = this.mainWindow.win.webContents.getZoomLevel();
      this.mainWindow.win.webContents.setZoomLevel(currentzoom + 1);
    });

    ipcMain.on('zoom-out', () => {
      const currentzoom = this.mainWindow.win.webContents.getZoomLevel();
      this.mainWindow.win.webContents.setZoomLevel(currentzoom - 1);
    });

    ipcMain.on('install-npcap', () => {
      const postInstallCallback = (err) => {
        if (err) {
          log.error(err);
        } else {
          app.relaunch();
          app.exit();
        }
      };
      if (isDev) {
        exec(`"${join(__dirname, '../../../../../desktop/npcap-1.50.exe')}"`, postInstallCallback);
      } else {
        exec(`"${join(app.getAppPath(), '../../resources/MachinaWrapper/', 'npcap-1.50.exe')}"`, postInstallCallback);
      }
    });
  }

  private setupProxyManagerListeners(): void {
    ipcMain.on('proxy-bypass', (event, value) => {
      this.store.set('proxy-bypass', value);
      event.sender.send('proxy-bypass:value', value);

      this.proxyManager.setProxy(this.mainWindow.win, {
        bypass: value
      });
    });

    ipcMain.on('proxy-bypass:get', (event) => {
      event.sender.send('proxy-bypass:value', this.store.get('proxy-bypass', ''));
    });

    ipcMain.on('proxy-rule', (event, value) => {
      this.store.set('proxy-rule', value);
      event.sender.send('proxy-rule:value', value);

      this.proxyManager.setProxy(this.mainWindow.win, {
        rule: value
      });
    });

    ipcMain.on('proxy-rule:get', (event) => {
      event.sender.send('proxy-rule:value', this.store.get('proxy-rule', ''));
    });

    ipcMain.on('proxy-pac', (event, value) => {
      this.store.set('proxy-pac', value);
      event.sender.send('proxy-pac:value', value);

      this.proxyManager.setProxy(this.mainWindow.win, {
        pac: value
      });
    });

    ipcMain.on('proxy-pac:get', (event) => {
      event.sender.send('proxy-pac:value', this.store.get('proxy-pac', ''));
    });
  }

  private setupInventoryListeners(): void {
    const inventoryPath = join(app.getPath('userData'), 'inventory.json');

    ipcMain.on('inventory:set', (event, inventory) => {
      writeFileSync(inventoryPath, JSON.stringify(inventory));
      this.overlayManager.forEachOverlay(overlay => {
        if (overlay && !overlay.isDestroyed()) {
          overlay.webContents.send('inventory:overlay:set', inventory);
        }
      });
    });

    ipcMain.on('inventory:get', (event, inventory) => {
      readFile(inventoryPath, 'utf8', (err, content) => {
        if (err) {
          event.sender.send('inventory:value', {});
        } else {
          try {
            event.sender.send('inventory:value', JSON.parse(content));
          } catch (e) {
            event.sender.send('inventory:value', {});
          }
        }
      });
    });


  }

  private setupFreeCompanyWorkshopsListeners(): void {
    const freeCompanyWorkshopsPath = join(app.getPath('userData'), 'free-company-workshops.json');

    ipcMain.on('free-company-workshops:set', (event, workshops) => {
      writeFileSync(freeCompanyWorkshopsPath, JSON.stringify(workshops));
    });

    ipcMain.on('free-company-workshops:get', (event, inventory) => {
      readFile(freeCompanyWorkshopsPath, 'utf8', (err, content) => {
        if (err) {
          event.sender.send('free-company-workshops:value', { freeCompanyWorkshops: [] });
        } else {
          try {
            event.sender.send('free-company-workshops:value', JSON.parse(content));
          } catch (e) {
            event.sender.send('free-company-workshops:value', { freeCompanyWorkshops: [] });
          }
        }
      });
    });
  }

  private setupLodestoneListeners(): void {
    ipcMain.on('lodestone:getCharacter', (event, id) => {
      const worker = new Worker(isDev ? join(__dirname, '../workers/lodestone.js') : join(app.getAppPath(), '../../resources/app.asar.unpacked/dist/apps/electron/src/workers/lodestone.js'), {
        workerData: id
      });
      worker.on('message', (char) => {
        event.sender.send(`lodestone:character:${id}`, {
          Character: {
            ID: +id,
            ...char
          }
        });
      });
      worker.on('error', (e) => {
        console.error(`Worker Lodestone parsing error`, e);
        this.characterParser.parse({ params: { characterId: id } } as any).then(char => {
          event.sender.send(`lodestone:character:${id}`, {
            Character: {
              ID: +id,
              ...char
            }
          });
        }).catch(err => console.error(`Direct lodestone parsing error`, err));
        worker.terminate();
      });
      worker.on('exit', (code) => {
        if (code !== 0)
          worker.terminate();
      });
    });
    ipcMain.on('lodestone:searchCharacter', (event, { name, server }) => {
      this.characterSearchParser.parse({ query: { name, server } } as any).then((res: { List: any[] }) => {
        event.sender.send('lodestone:character:search', res.List);
      });
    });
  }

  private sendPageView(ga3user: any, url: string): void {
    ga3user.pageview(url).send();
  }

  private setupAnalyticsListeners(): void {
    let ga3user = null;
    let key = null;
    const uuid = this.store.get('analytics:uuid', uuidv4());
    this.store.set('analytics:uuid', uuid);

    ipcMain.on('analytics:init', async (event, { ga3, ga4, language }) => {
      ga3user = ua(ga3, uuid, null, { platform: 'electron' });
      key = await fetch('https://us-central1-ffxivteamcraft.cloudfunctions.net/electron-mp').then(async res => await res.text());
      this.sendPageView(ga3user, '/');
      ga3user.set('ds', 'app');
      ga3user.set('ul', language);
    });

    ipcMain.on('analytics:pageView', (event, url) => {
      if (key) {
        this.sendPageView(ga3user, url);
      }
    });
  }
}
