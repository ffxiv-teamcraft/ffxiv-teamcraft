import { exec, execSync } from 'child_process';
import { MainWindow } from '../window/main-window';
import { Store } from '../store';
import { join, resolve } from 'path';
import { app } from 'electron';
import isDev from 'electron-is-dev';
import log from 'electron-log';
import { default as isElevated } from 'native-is-elevated';
import { CaptureInterface, CaptureInterfaceOptions, Message } from '@ffxiv-teamcraft/pcap-ffxiv';

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
    'systemLogMessage',
    'npcSpawn',
    'objectSpawn'
  ];

  private static readonly MACHINA_EXE_PATH = join(app.getAppPath(), '../../resources/MachinaWrapper/MachinaWrapper.exe');

  private captureInterface: CaptureInterface;

  constructor(private mainWindow: MainWindow, private store: Store, private options: any) {
    this.mainWindow.closed$.subscribe(() => {
      this.stop();
    });
  }

  start(): void {
    if (this.store.get('rawsock', false)) {
      this.startMachina();
    } else {
      try {
        execSync('Get-Service -Name Npcap', { 'shell': 'powershell.exe', 'timeout': 5000, 'stdio': ['ignore', 'pipe', 'ignore'], 'windowsHide': true });
        log.debug('The Npcap service was detected, starting Machina');
        this.startMachina();
      } catch (err) {
        log.error(`Error and/or possible timeout while detecting the Npcap windows service: ${err}`);
        if (err.message.includes('ETIMEDOUT')) {
          log.log(`Starting machina since it's just a timeout`);
          this.startMachina();
        } else {
          this.mainWindow.win.webContents.send('install-npcap-prompt', true);
        }
      }
    }
  }

  stop(): void {
    if (this.captureInterface) {
      this.captureInterface.stop();
    }
  }

  addMachinaFirewallRule(): void {
    exec(`netsh advfirewall firewall add rule name="FFXIVTeamcraft - Machina" dir=in action=allow program="${PacketCapture.MACHINA_EXE_PATH}" enable=yes`);
  }

  sendToRenderer(packet: Message): void {
    if (this.mainWindow?.win) {
      try {
        this.mainWindow.win.webContents.send('packet', packet);
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

  private async startMachina(): Promise<void> {
    const region = this.store.get('region', 'Global');
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

    const options: Partial<CaptureInterfaceOptions> = {
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
    this.captureInterface = new CaptureInterface(options);
    this.captureInterface.start()
      .then(() => {
        log.info('Packet capture started');
      })
      .catch((err) => {
        log.error(`Couldn't start packet capture`);
        log.error(err);
        if (err.message === `Cannot call write after a stream was destroyed`) {
          this.mainWindow.win.webContents.send('machina:error', {
            message: 'Wrapper_failed_to_start',
            retryDelay: 120
          });
        }
        setTimeout(() => {
          this.start();
        }, 120000);
      });
    this.captureInterface.on('error', err => {
      this.mainWindow.win.webContents.send('machina:error:raw', {
        message: err
      });
    });
    this.captureInterface.setMaxListeners(0);
    this.captureInterface.on('message', (message) => {
      if (this.options.verbose) {
        log.log(JSON.stringify(message));
      }
      this.sendToRenderer(message);
    });
  }
}
