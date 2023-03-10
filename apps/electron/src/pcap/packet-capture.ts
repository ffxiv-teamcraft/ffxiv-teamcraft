import { MainWindow } from '../window/main-window';
import { Store } from '../store';
import { resolve } from 'path';
import isDev from 'electron-is-dev';
import log from 'electron-log';
import { CaptureInterface, CaptureInterfaceOptions, Message, Region } from '@ffxiv-teamcraft/pcap-ffxiv';
import { DeucalionErrors } from './deucalion-errors';

export class PacketCapture {

  private static readonly ACCEPTED_PACKETS: Message['type'][] = [
    'actorCast',
    'actorControl',
    'actorControlSelf',
    'airshipExplorationResult',
    'airshipStatus',
    'airshipStatusList',
    'airshipTimers',
    'currencyCrystalInfo',
    'clientTrigger',
    'desynthResult',
    'effectResult',
    'eventFinish',
    'eventPlay',
    'eventPlay64',
    'eventPlay32',
    'eventPlay4',
    'eventPlay8',
    'eventStart',
    'freeCompanyInfo',
    'freeCompanyDialog',
    'initZone',
    'inventoryModifyHandler',
    'inventoryTransaction',
    'itemInfo',
    'itemMarketBoardInfo',
    'islandWorkshopSupplyDemand',
    'containerInfo',
    'logout',
    'marketBoardItemListing',
    'marketBoardItemListingCount',
    'marketBoardItemListingHistory',
    'marketBoardSearchResult',
    'marketBoardPurchaseHandler',
    'marketBoardPurchase',
    'npcSpawn',
    'objectSpawn',
    'playerSetup',
    'playerSpawn',
    'playerStats',
    'prepareZoning',
    'resultDialog',
    'retainerInformation',
    'systemLogMessage',
    'submarineExplorationResult',
    'submarineProgressionStatus',
    'submarineStatusList',
    'submarineTimers',
    'updateClassInfo',
    'updateInventorySlot',
    'updatePositionHandler',
    'updatePositionInstance',
    'weatherChange',
    'statusEffectList'
  ];

  private static readonly PACKETS_FROM_OTHERS = [
    'playerSpawn',
    'actorControl',
    'updateClassInfo',
    'actorControlSelf',
    'eventPlay',
    'eventStart',
    'eventFinish',
    'eventPlay4',
    'eventPlay64',
    'systemLogMessage',
    'npcSpawn',
    'objectSpawn'
  ];

  private captureInterface: CaptureInterface;

  private startTimeout = null;

  private tries = 0;

  private overlayListeners = [];

  private get region(): Region {
    return this.store.get<Region>('region', 'Global');
  }

  constructor(private mainWindow: MainWindow, private store: Store, private options: any) {
    this.mainWindow.closed$.subscribe(() => {
      this.stop();
    });
  }

  start(): void {
    this.startPcap();
  }

  restart(): void {
    this.tries = 0;
    this.stop().then(() => {
      setTimeout(() => {
        this.mainWindow.win.webContents.send('pcap:status', 'starting');
        this.start();
      }, 1000);
    });
  }

  stop(): Promise<void> {
    this.mainWindow.win.webContents.send('pcap:status', 'stopped');
    if (this.startTimeout) {
      clearTimeout(this.startTimeout);
      delete this.startTimeout;
    }
    return this.captureInterface.stop();
  }

  public registerOverlayListener(id: string, listener: (packet: Message) => void): void {
    if (this.overlayListeners.some(l => l.id === id)) {
      this.unregisterOverlayListener(id);
    }
    this.overlayListeners.push({
      id,
      listener
    });
  }

  public unregisterOverlayListener(id: string): void {
    this.overlayListeners = this.overlayListeners.filter(l => l.id === id);
  }

  sendToRenderer(packet: Message): void {
    if (this.mainWindow?.win) {
      try {
        this.mainWindow.win.webContents.send('packet', packet);
        this.overlayListeners.forEach(l => {
          try {
            l.listener(packet);
          } catch (e) {
            this.unregisterOverlayListener(l.id);
          }
        });
      } catch (e) {
        log.error(packet);
        log.error(e);
      }
    }
  }

  private getLocalDataPath(): string | null {
    // --localOpcodes [path]

    const argv = process.argv.slice(1);
    const index = argv.indexOf('--localOpcodes');

    if (index === -1) {
      return null;
    }

    const value = argv[index + 1];
    if (value && value[0] !== '-') {
      return resolve(value);
    } else {
      return resolve('opcodes');
    }
  }

  private async startPcap(): Promise<void> {
    if (this.startTimeout) {
      clearTimeout(this.startTimeout);
      delete this.startTimeout;
    }
    const region = this.store.get<Region>('region', 'Global');

    this.mainWindow.win.webContents.send('pcap:status', 'starting');

    this.startGlobalPcap(region);
  }

  private startGlobalPcap(region: Region): void {
    const options: Partial<CaptureInterfaceOptions> = {
      region: region,
      filter: (header, typeName: Message['type']) => {
        if (header.sourceActor === header.targetActor) {
          return PacketCapture.ACCEPTED_PACKETS.includes(typeName);
        }
        return PacketCapture.PACKETS_FROM_OTHERS.includes(typeName);
      },
      logger: message => {
        if (message.type === 'info' && this.options.verbose) {
          log.info(message.message);
        } else if (message.type !== 'info') {
          log[message.type || 'warn'](message.message);
        }
      }
    };

    if (isDev) {
      const localDataPath = this.getLocalDataPath();
      if (localDataPath) {
        options.localDataPath = localDataPath;
        log.info('[pcap] Using localOpcodes:', localDataPath);
      }
    }

    log.info(`Starting PacketCapture with options: ${JSON.stringify(options)}`);
    this.captureInterface = new CaptureInterface(options);
    this.captureInterface.on('error', err => {
      this.mainWindow.win.webContents.send('pcap:status', 'error');
      this.mainWindow.win.webContents.send('pcap:error:raw', {
        message: err
      });
      log.error(err);
    });
    this.captureInterface.setMaxListeners(0);
    this.captureInterface.on('message', (message) => {
      if (this.options.verbose) {
        log.log(JSON.stringify(message));
      }
      this.sendToRenderer(message);
    });
    this.captureInterface.on('ready', () => {
      // Give it 200ms to make sure pipe is created
      setTimeout(() => {
        this.captureInterface.start()
          .then(() => {
            this.mainWindow.win.webContents.send('pcap:status', 'running');
            log.info('Packet capture started');
          }).catch(err => {
          this.mainWindow.win.webContents.send('pcap:status', 'error');
          log.error(`Couldn't start packet capture`);
          log.error(err);
          if (err.includes(DeucalionErrors.ERR_GAME_NOT_RUNNING)) {
            this.mainWindow.win.webContents.send('pcap:error', {
              message: 'ERR_GAME_NOT_RUNNING',
              retryDelay: 60
            });
          } else {
            this.mainWindow.win.webContents.send('pcap:error', {
              message: 'Default',
              retryDelay: 60
            });
          }
          this.onStartError();
        });
      }, 200);
    });
  }

  private onStartError(): void {
    console.log('On start error', this.tries);
    this.tries++;
    if (this.tries < 3) {
      console.log('Failed to start pcap, retrying in 60s');
      if (!this.startTimeout) {
        this.startTimeout = setTimeout(() => {
          this.start();
        }, 60000);
      }
    } else {
      this.stop();
    }
  }
}
