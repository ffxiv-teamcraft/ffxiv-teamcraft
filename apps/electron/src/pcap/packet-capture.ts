import { exec } from 'child_process';
import { MainWindow } from '../window/main-window';
import { Store } from '../store';
import { join } from 'path';
import { app } from 'electron';
import * as isDev from 'electron-is-dev';
import * as log from 'electron-log';
import { CaptureInterface, CaptureInterfaceOptions } from '@ffxiv-teamcraft/pcap-ffxiv';

export class PacketCapture {

  private static readonly ACCEPTED_PACKETS = [
    'actorCast',
    'actorControl',
    'actorControlSelf',
    'addStatusEffect',
    'airshipExplorationResult',
    'airshipStatus',
    'airshipStatusList',
    'airshipTimers',
    'currencyCrystalInfo',
    'desynthResult',
    'effectResult',
    'eventFinish',
    'eventPlay',
    'eventPlay32',
    'eventPlay4',
    'eventPlay8',
    'eventStart',
    'freeCompanyInfo',
    'initZone',
    'inventoryModifyHandler',
    'inventoryTransaction',
    'itemInfo',
    'logout',
    'marketBoardItemListing',
    'marketBoardItemListingCount',
    'marketBoardItemListingHistory',
    'marketBoardSearchResult',
    'npcSpawn',
    'objectSpawn',
    'playerSetup',
    'playerSpawn',
    'playerStats',
    'prepareZoning',
    'resultDialog',
    'retainerInformation',
    'someDirectorUnk4',
    'submarineExplorationResult',
    'submarineProgressionStatus',
    'submarineStatusList',
    'submarineTimers',
    'updateClassInfo',
    'updateInventorySlot',
    'updatePositionHandler',
    'updatePositionInstance',
    'weatherChange'
  ];

  private static readonly PACKETS_FROM_OTHERS = [
    'playerSpawn',
    'actorControl',
    'updateClassInfo',
    'actorControlSelf',
    'effectResult',
    'eventPlay',
    'eventStart',
    'eventFinish',
    'eventPlay4',
    'someDirectorUnk4',
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
    exec('Get-Service -Name Npcap', { 'shell': 'powershell.exe' }, (err) => {
      if (err) {
        this.mainWindow.win.webContents.send('install-npcap-prompt', true);
      } else {
        this.startMachina();
      }
    });
  }

  stop(): void {
    if (this.captureInterface) {
      this.captureInterface.stop();
    }
  }

  addMachinaFirewallRule(): void {
    exec(`netsh advfirewall firewall add rule name="FFXIVTeamcraft - Machina" dir=in action=allow program="${PacketCapture.MACHINA_EXE_PATH}" enable=yes`);
  }

  sendToRenderer(packet: any): void {
    if (this.mainWindow?.win) {
      this.mainWindow.win.webContents.send('packet', packet);
    }
  }

  private async startMachina(): Promise<void> {
    const region = this.store.get('region', 'Global');
    const rawsock = this.store.get('rawsock', false);
    const elevated = await require('is-elevated')();

    if (rawsock) {
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
      filter: (header, typeName) => {
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

    this.captureInterface = new CaptureInterface(isDev ? options : { ...options, exePath: PacketCapture.MACHINA_EXE_PATH });
    this.captureInterface.start().then(() => {
      log.info('Packet capture started');
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
