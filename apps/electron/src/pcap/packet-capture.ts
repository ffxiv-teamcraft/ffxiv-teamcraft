import { exec, execSync } from 'child_process';
import { MainWindow } from '../window/main-window';
import { Store } from '../store';
import { join, resolve } from 'path';
import { app } from 'electron';
import isDev from 'electron-is-dev';
import log from 'electron-log';
import { default as isElevated } from 'native-is-elevated';
import { CaptureInterface, CaptureInterfaceOptions, Message, Region } from '@ffxiv-teamcraft/pcap-ffxiv';
import {
  CaptureInterface as KRCNCaptureInterface,
  CaptureInterfaceOptions as KRCNCaptureInterfaceOptions,
  Message as KRCNMessage
} from '@ffxiv-teamcraft/pcap-ffxiv-krcn';
import { DeucalionErrors } from './deucalion-errors';
import { existsSync } from 'fs';

const hash = require('object-hash');

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

  private static readonly DEUCALION_EXE_PATH = join(app.getAppPath(), '../../resources/deucalion/deucalion.exe');

  private static readonly MACHINA_EXE_PATH = join(app.getAppPath(), '../../resources/MachinaWrapper/krcn/MachinaWrapper.exe');

  private captureInterface: CaptureInterface | KRCNCaptureInterface;

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
    if (this.store.get('rawsock', false)) {
      this.startPcap();
    } else {
      try {
        execSync('Get-Service -Name Npcap', { 'shell': 'powershell.exe', 'timeout': 5000, 'stdio': ['ignore', 'pipe', 'ignore'], 'windowsHide': true });
        log.debug('The Npcap service was detected, starting Machina');
        this.startPcap();
      } catch (err) {
        log.error(`Error and/or possible timeout while detecting the Npcap windows service: ${err}`);
        if (err.message.includes('ETIMEDOUT')) {
          log.log(`Starting machina since it's just a timeout`);
          this.startPcap();
        } else {
          this.mainWindow.win.webContents.send('install-npcap-prompt', true);
        }
      }
    }
  }

  restart(): void {
    this.tries = 0;
    this.stop();
    setTimeout(() => {
      this.mainWindow.win.webContents.send('pcap:status', 'starting');
      this.start();
    }, 1000);
  }

  stop(): Promise<void> {
    this.mainWindow.win.webContents.send('pcap:status', 'stopped');
    if (this.startTimeout) {
      clearTimeout(this.startTimeout);
      delete this.startTimeout;
    }
    if (this.captureInterface instanceof KRCNCaptureInterface) {
      return this.captureInterface.stop();
    }
    if (this.captureInterface instanceof CaptureInterface) {
      this.captureInterface.stop();
    }
    return Promise.resolve();
  }

  addMachinaFirewallRule(): void {
    exec(`netsh advfirewall firewall add rule name="FFXIVTeamcraft - Machina" dir=in action=allow program="${PacketCapture.MACHINA_EXE_PATH}" enable=yes`);
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

  sendToRenderer(packet: Message | KRCNMessage): void {
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

    if (region === 'KR' || region === 'CN') {
      await this.startKRCNPcap(region);
    } else {
      this.startGlobalPcap(region);
    }
  }

  private startGlobalPcap(region): void {
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
    } else {
      options.deucalionExePath = PacketCapture.DEUCALION_EXE_PATH;
    }

    if (options.deucalionExePath && !existsSync(options.deucalionExePath)) {
      this.mainWindow.win.webContents.send('pcap:status', 'error');
      this.mainWindow.win.webContents.send('pcap:error:raw', {
        code: 'DEUCALION_NOT_FOUND',
        message: `File not found: ${options.deucalionExePath}`
      });
      log.error(`File not found: ${options.deucalionExePath}`);
      return;
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

  private async startKRCNPcap(region: Region) {
    const rawsock = this.store.get('rawsock', false);
    if (rawsock) {
      const elevated = await isElevated();
      if (!elevated) {
        this.mainWindow.win.webContents.send('rawsock-needs-admin', true);
        return;
      }
      const appPath = app.getAppPath();
      const appVersion = /\d+\.\d+\.\d+/.exec(appPath)[0];
      exec(`netsh advfirewall firewall show rule status=enabled name="FFXIVTeamcraft - Machina" verbose`, (...output) => {
        if (output[1].indexOf(appVersion) === -1) {
          exec('netsh advfirewall firewall delete rule name="FFXIVTeamcraft - Machina"', () => {
            this.addMachinaFirewallRule();
          });
        }
      });
    }

    const options: Partial<KRCNCaptureInterfaceOptions> = {
      monitorType: rawsock ? 'RawSocket' : 'WinPCap',
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

    if (this.options.pid) {
      options.pid = this.options.pid;
    }

    if (isDev) {
      const localDataPath = this.getLocalDataPath();
      if (localDataPath) {
        options.localDataPath = localDataPath;
        log.info('[pcap] Using localOpcodes:', localDataPath);
      }
    } else {
      options.exePath = PacketCapture.MACHINA_EXE_PATH;
    }

    log.info(`Starting PacketCapture with options: ${JSON.stringify(options)}`);
    this.captureInterface = new KRCNCaptureInterface(options);
    this.captureInterface.on('error', err => {
      this.mainWindow.win.webContents.send('pcap:status', 'error');
      this.mainWindow.win.webContents.send('machina:error:raw', {
        message: err
      });
      log.error('ERROR EVENT');
      log.error(err);
    });
    this.captureInterface.setMaxListeners(0);
    this.captureInterface.on('message', (message) => {
      if (this.options.verbose) {
        log.log(JSON.stringify(message));
      }
      this.sendToRenderer(message);
    });
    await this.captureInterface.start()
      .then(() => {
        this.mainWindow.win.webContents.send('pcap:status', 'running');
        log.info('Packet capture started');
      })
      .catch((err) => {
        this.mainWindow.win.webContents.send('pcap:status', 'error');
        log.error(`Couldn't start packet capture`);
        log.error(err);
        if (err.code === `ERR_STREAM_DESTROYED` || err.code === 'EPIPE') {
          this.mainWindow.win.webContents.send('machina:error', {
            message: 'Wrapper_failed_to_start',
            retryDelay: 60
          });
        }
        this.onStartError();
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
