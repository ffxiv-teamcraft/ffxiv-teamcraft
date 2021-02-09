import { exec } from 'child_process';
import { MainWindow } from '../window/main-window';
import { Store } from '../store';
import { join } from 'path';
import { app } from 'electron';
import * as isDev from 'electron-is-dev';
import * as log from 'electron-log';
import * as MachinaFFXIV from 'node-machina-ffxiv';

export class PacketCapture {

  private static readonly ACCEPTED_PACKETS = [
    'actorCast',
    'actorControl',
    'actorControlSelf',
    'addStatusEffect',
    'airshipExplorationResult',
    'airshipStatus',
    'currencyCrystalInfo',
    'desynthResult',
    'effectResult',
    'eventFinish',
    'eventPlay',
    'eventPlay32',
    'eventPlay4',
    'eventStart',
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
    'submarineStatusList',
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

  private machina: any;

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
    if (this.machina) {
      this.machina.stop();
    }
  }

  addMachinaFirewallRule(): void {
    exec(`netsh advfirewall firewall add rule name="FFXIVTeamcraft - Machina" dir=in action=allow program="${PacketCapture.MACHINA_EXE_PATH}" enable=yes`);
  }

  sendToRenderer(packet: any): void {
    if (this.mainWindow) {
      this.mainWindow.win.webContents.send('packet', packet);
    }
  }

  private filterPacketSessionID(packet: any): boolean {
    return PacketCapture.PACKETS_FROM_OTHERS.indexOf(packet.type) > -1
      || packet.sourceActorSessionID === packet.targetActorSessionID;
  }

  private async startMachina(): Promise<void> {
    const region = this.store.get('region', null);
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

    const options: any = isDev ?
      {
        monitorType: rawsock ? 'RawSocket' : 'WinPCap',
        parseAlgorithm: 'PacketSpecific',
        region: region
      } : {
        monitorType: rawsock ? 'RawSocket' : 'WinPCap',
        parseAlgorithm: 'PacketSpecific',
        region: region,
        noData: true,
        machinaExePath: PacketCapture.MACHINA_EXE_PATH,
        remoteDataPath: join(app.getAppPath(), '../../resources/remote-data'),
        definitionsDir: join(app.getAppPath(), '../../resources/app.asar.unpacked/node_modules/node-machina-ffxiv/models/default')
      };

    options.logger = message => {
      if (message.level === 'info' && this.options.verbose) {
        log.info(message.message);
      } else if (message.level !== 'info') {
        log[message.level || 'warn'](message.message);
      }
    };

    if (this.options.pid) {
      options.pid = this.options.pid;
    }

    this.machina = new MachinaFFXIV(options);
    this.machina.filter(PacketCapture.ACCEPTED_PACKETS);
    this.machina.start(() => {
      log.info('Packet capture started');
    });
    this.machina.setMaxListeners(0);
    this.machina.on('any', (packet) => {
      if (this.options.verbose) {
        log.log(JSON.stringify(packet));
      }
      if (!this.filterPacketSessionID(packet)) {
        return;
      }
      if (PacketCapture.ACCEPTED_PACKETS.indexOf(packet.type) > -1 || PacketCapture.ACCEPTED_PACKETS.indexOf(packet.superType) > -1) {
        this.sendToRenderer(packet);
      }
    });
  }
}
