import { MainWindow } from '../window/main-window';
import { Store } from '../store';
import { join, resolve } from 'path';
import { existsSync } from 'fs';
import { spawn, execSync, ChildProcess } from 'child_process';
import log from 'electron-log';
import type { CaptureInterface, CaptureInterfaceOptions, Message, Region } from '@ffxiv-teamcraft/pcap-ffxiv';
import { app, dialog, ipcMain, OpenDialogOptions } from 'electron';

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
    'craftingLog',
    'desynthResult',
    'effectResult',
    'eventFinish',
    'eventPlay',
    'eventPlay64',
    'eventPlay32',
    'eventPlay4',
    'eventPlay8',
    'eventStart',
    'fishCaught',
    'freeCompanyInfo',
    'freeCompanyDialog',
    'gatheringLog',
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
  private bridgeProcess: ChildProcess | null = null;

  private overlayListeners = [];

  constructor(private mainWindow: MainWindow, private store: Store, private options: any) {
    this.mainWindow.closed$.subscribe(() => {
      this.stop();
    });

    if (process.platform !== 'win32') {
      this.registerWinePathIpc();
    }
  }

  /**
   * Starts the deucalion bridge using the Wine paths from the store.
   * Throws if the paths are not configured or if spawning fails.
   */
  private startBridge(): void {
    const winePrefix = this.store.get<string>('winePrefix', '');
    const wineBin = this.store.get<string>('wineBin', '');
    if (!winePrefix || !wineBin) {
      throw new Error('Wine paths not configured');
    }
    const dllWinPath = this.toWinePath(this.getDeucalionDllPath());
    this.spawnBridge(dllWinPath, 31594, winePrefix, wineBin);
  }

  private registerWinePathIpc(): void {
    ipcMain.on('bridge:wineprefix:get', (event) => {
      event.sender.send('bridge:wineprefix:value', this.store.get<string>('winePrefix', ''));
    });

    ipcMain.on('bridge:wineprefix:set', (event) => {
      const current = this.store.get<string>('winePrefix', '');
      const opts: OpenDialogOptions = {
        defaultPath: current || app.getPath('home'),
        properties: ['openDirectory']
      };
      dialog.showOpenDialog(this.mainWindow.win, opts).then((result) => {
        if (result.canceled) return;
        this.store.set('winePrefix', result.filePaths[0]);
        event.sender.send('bridge:wineprefix:value', this.store.get<string>('winePrefix', ''));
        if (this.captureInterface) {
          try {
            this.startBridge();
          } catch (e) {
            log.error('[bridge] Failed to restart bridge after settings change:', e);
          }
        }
      });
    });

    ipcMain.on('bridge:winebin:get', (event) => {
      event.sender.send('bridge:winebin:value', this.store.get<string>('wineBin', ''));
    });

    ipcMain.on('bridge:winebin:set', (event) => {
      const current = this.store.get<string>('wineBin', '');
      const opts: OpenDialogOptions = {
        defaultPath: current ? join(current, '..') : app.getPath('home'),
        properties: ['openFile']
      };
      dialog.showOpenDialog(this.mainWindow.win, opts).then((result) => {
        if (result.canceled) return;
        this.store.set('wineBin', result.filePaths[0]);
        event.sender.send('bridge:winebin:value', this.store.get<string>('wineBin', ''));
        if (this.captureInterface) {
          try {
            this.startBridge();
          } catch (e) {
            log.error('[bridge] Failed to restart bridge after settings change:', e);
          }
        }
      });
    });
  }

  async restart() {
    await this.stop();
    this.mainWindow.win.webContents.send('pcap:status', 'starting');
    setTimeout(() => {
      this.startPcap();
    }, 1000);
  }

  async stop(): Promise<void> {
    if (this.bridgeProcess) {
      this.bridgeProcess.kill();
      this.bridgeProcess = null;
    }
    if (this.captureInterface) {
      await this.captureInterface.stop();
      delete this.captureInterface;
    }
    return Promise.resolve();
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

  public async startPcap(): Promise<void> {
    const region = this.store.get<Region>('region', 'Global');

    this.mainWindow.win.webContents.send('pcap:status', 'starting');

    await this.startGlobalPcap(region);
  }

  private async startGlobalPcap(region: Region): Promise<void> {
    try {
      const { CaptureInterface, ErrorCodes } = await import('@ffxiv-teamcraft/pcap-ffxiv');
      const options: Partial<CaptureInterfaceOptions> = {
        region: region,
        filter: (header, typeName: Message['type']) => {
          if (header.sourceActor === header.targetActor) {
            return PacketCapture.ACCEPTED_PACKETS.includes(typeName);
          }
          return PacketCapture.PACKETS_FROM_OTHERS.includes(typeName);
        },
        logger: message => {
          log[message.type || 'warn'](message.message);
        },
        name: 'FFXIV_Teamcraft'
      };

      if (process.platform !== 'win32') {
        const winePrefix = this.store.get<string>('winePrefix', '');
        const wineBin = this.store.get<string>('wineBin', '');

        if (!winePrefix || !wineBin) {
          log.error('[pcap] One or more Wine paths are not configured:', { winePrefix, wineBin });
          this.store.set('machina', false);
          this.mainWindow.win.webContents.send('toggle-pcap:value', false);
          this.mainWindow.win.webContents.send('pcap:status', 'error');
          this.mainWindow.win.webContents.send('pcap:error', { message: 'BRIDGE_PATHS_NOT_CONFIGURED' });
          return;
        }

        // With some launchers, the bridge process (Wine) prevents the game from
        // booting if it starts before ffxiv_dx11.exe is already running.  Fail
        // fast with a clear error so the user knows to launch the game first.
        if (!this.isGameRunningViaWine()) {
          log.error('[pcap] ffxiv_dx11.exe is not running; refusing to start bridge');
          this.store.set('machina', false);
          this.mainWindow.win.webContents.send('toggle-pcap:value', false);
          this.mainWindow.win.webContents.send('pcap:status', 'error');
          this.mainWindow.win.webContents.send('pcap:error', { message: 'BRIDGE_GAME_NOT_RUNNING' });
          return;
        }

        // deucalion-bridge.exe runs under Wine and forwards the deucalion
        // named pipe over TCP.
        try {
          this.startBridge();
          options.bridgeTcpPort = 31594;
        } catch (e) {
          log.error('[pcap] Failed to set up deucalion bridge:', e);
          this.mainWindow.win.webContents.send('pcap:status', 'error');
          this.mainWindow.win.webContents.send('pcap:error', { message: 'BRIDGE_SETUP_FAILED' });
          return;
        }
      } else if (!app.isPackaged) {
        const localDataPath = this.getLocalDataPath();
        if (localDataPath) {
          options.localDataPath = localDataPath;
          log.info('[pcap] Using localOpcodes:', localDataPath);
        }
      } else {
        options.deucalionDllPath = this.getDeucalionDllPath();
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
      this.captureInterface.on('stopped', () => {
        this.mainWindow.win.webContents.send('pcap:status', 'stopped');
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
          if (!this.captureInterface) return;
          this.captureInterface.start()
            .then(() => {
              this.mainWindow.win.webContents.send('pcap:status', 'running');
              log.info('Packet capture started');
            })
            .catch((errCode) => {
              this.mainWindow.win.webContents.send('pcap:status', 'error');
              log.error(`Couldn't start packet capture`);
              log.error(ErrorCodes[errCode] || `CODE: ${errCode}`);

              if (ErrorCodes[errCode]) {
                this.mainWindow.win.webContents.send('pcap:error', {
                  message: ErrorCodes[errCode]
                });
              } else if (errCode.toString().includes('ENOENT')) {
                this.mainWindow.win.webContents.send('pcap:error', {
                  message: 'RESTART_GAME'
                });
              } else {
                this.mainWindow.win.webContents.send('pcap:error', {
                  message: 'Default'
                });
              }
            });
        }, 200);
      });
    } catch (e) {
      if (e.message.includes('dll-inject')) {
        this.mainWindow.win.webContents.send('pcap:status', 'error');
        this.mainWindow.win.webContents.send('pcap:error', {
          message: 'MISSING_INJECTOR'
        });
        log.error('[pcap] MISSING_INJECTOR');
      } else {
        log.error(e);
      }
    }
  }

  /**
   * Returns true if ffxiv_dx11.exe is currently running as a Wine process.
   * Uses pgrep to search the full command line so it matches regardless of
   * how Wine surfaces the executable name in the process table.
   */
  private isGameRunningViaWine(): boolean {
    try {
      execSync('pgrep -f ffxiv_dx11.exe', { stdio: 'ignore' });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Walks up the directory tree from __dirname to locate deucalion.dll inside
   * node_modules. Necessary in dev/unpackaged builds because webpack compiles
   * require.resolve() to a numeric module ID rather than a real path.
   */
  private findDevDeucalionDll(): string {
    const rel = 'node_modules/@ffxiv-teamcraft/pcap-ffxiv/lib/deucalion/deucalion.dll';
    let dir = __dirname;
    for (let i = 0; i < 8; i++) {
      const candidate = join(dir, rel);
      if (existsSync(candidate)) {
        return candidate;
      }
      const parent = join(dir, '..');
      if (parent === dir) break;
      dir = parent;
    }
    throw new Error(`Cannot find deucalion.dll in node_modules (searched up from ${__dirname})`);
  }

  /**
   * Returns the native path to the bundled deucalion.dll.
   * Packaged builds find it in extraFiles next to the app; dev builds walk up
   * from __dirname to locate it inside node_modules.
   */
  private getDeucalionDllPath(): string {
    if (app.isPackaged) {
      return region === 'TW' ? join(app.getAppPath(), '../../deucalion/deucalion_12.dll') : join(app.getAppPath(), '../../deucalion/deucalion.dll');
    }
    return this.findDevDeucalionDll();
  }

  /**
   * Converts a Unix absolute path to a Wine Z: drive path.
   * Wine's Z: drive maps directly to the root filesystem.
   */
  private toWinePath(unixPath: string): string {
    return 'Z:' + unixPath.replace(/\//g, '\\');
  }

  /**
   * Spawns deucalion-bridge.exe under Wine. The bridge will:
   * 1. Wait for ffxiv_dx11.exe to appear
   * 2. Inject deucalion.dll
   * 3. Forward the named pipe over TCP on the given port
   *
   * The bridge process runs in the background; Deucalion.startTcp() will
   * keep retrying the TCP connection until the bridge is ready.
   */
  private spawnBridge(dllWinPath: string, port: number, winePrefix: string, wineBin: string, extraEnv: Record<string, string> = {}): void {
    if (this.bridgeProcess) {
      this.bridgeProcess.kill();
      this.bridgeProcess = null;
    }

    const bridgeExe = app.isPackaged
      ? join(app.getAppPath(), '../../deucalion-bridge/deucalion-bridge.exe')
      : join(__dirname, '../../../deucalion-bridge/deucalion-bridge.exe');

    log.info(`[bridge] spawning: ${wineBin} ${bridgeExe} --dll-path ${dllWinPath} --port ${port}`);

    this.bridgeProcess = spawn(wineBin, [bridgeExe, '--dll-path', dllWinPath, '--port', String(port)], {
      env: { ...process.env, WINEPREFIX: winePrefix, ...extraEnv }
    });

    let stderrBuffer = '';

    this.bridgeProcess.stdout?.on('data', (data: Buffer) => {
      for (const line of data.toString().split(/\r?\n/).filter(Boolean)) {
        log.info(line);
      }
    });

    this.bridgeProcess.stderr?.on('data', (data: Buffer) => {
      const chunk = data.toString();
      stderrBuffer += chunk;
      for (const line of chunk.split(/\r?\n/).filter(Boolean)) {
        log.info(line);
      }
    });

    this.bridgeProcess.on('error', err => log.error('[bridge] spawn error:', err));

    this.bridgeProcess.on('exit', (code, signal) => {
      log.info(`[bridge] exited code=${code} signal=${signal}`);
      this.bridgeProcess = null;
      // code=null means we killed it intentionally (SIGTERM). Any explicit
      // non-zero exit code means the bridge itself detected an error.
      if (code !== null && code !== 0 && this.captureInterface) {
        log.error(`[bridge] Abnormal exit (stderr: ${stderrBuffer.trim()})`);
        this.store.set('machina', false);
        this.mainWindow.win.webContents.send('toggle-pcap:value', false);
        this.mainWindow.win.webContents.send('pcap:status', 'error');
        this.mainWindow.win.webContents.send('pcap:error', { message: 'BRIDGE_ERROR' });
        this.stop();
      }
    });
  }

}
