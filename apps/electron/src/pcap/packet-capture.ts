import { MainWindow } from '../window/main-window';
import { Store } from '../store';
import { join, resolve } from 'path';
import { existsSync } from 'fs';
import { spawn, execSync, ChildProcess } from 'child_process';
import log from 'electron-log';
import type { CaptureInterface, CaptureInterfaceOptions, Message, Region } from '@ffxiv-teamcraft/pcap-ffxiv';
import { app, dialog, ipcMain, OpenDialogOptions } from 'electron';
import { WineResolver } from './wine-resolver';

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
  private wineResolver: WineResolver;

  private overlayListeners = [];

  constructor(private mainWindow: MainWindow, private store: Store, private options: any) {
    this.wineResolver = new WineResolver(store);

    this.mainWindow.closed$.subscribe(() => {
      this.stop();
    });

    if (process.platform !== 'win32') {
      const region = this.store.get<Region>('region', 'Global');
      this.registerWinePathIpc(region);
    }
  }

  /**
   * A Wine `wineserver` is shared per-prefix, but esync/msync synchronization
   * must match between every `wine` process and the already-running server.
   * XIV on Mac launches the game with WINEESYNC=1 WINEMSYNC=1 WINEFSYNC=0; if the
   * bridge's `wine` starts without these, it spins up a mismatched/second
   * wineserver and cannot enumerate or inject into ffxiv_dx11.exe. Mirror them
   * (darwin only) so the bridge attaches to the same server as the live game.
   */
  private getMacWineSyncEnv(): Record<string, string> {
    if (process.platform !== 'darwin') {
      return {};
    }
    return {
      WINEESYNC: '1',
      WINEMSYNC: '1',
      WINEFSYNC: '0',
      WINEDEBUG: '-all'
    };
  }

  /**
   * Starts the deucalion bridge. Resolves Wine paths from user overrides first,
   * then falls back to autodetection (XIVLauncher, Steam Proton or XIV on Mac).
   * Throws if the paths cannot be resolved or if spawning fails.
   */
  private startBridge(region: Region): void {
    const { prefix: winePrefix, bin: wineBin } = this.wineResolver.resolveWinePaths();
    if (!winePrefix || !wineBin) {
      throw new Error('Wine paths not configured and could not be auto-detected');
    }
    const dllWinPath = this.toWinePath(this.getDeucalionDllPath(region));
    const extraEnv = this.parseWineExtraEnv(this.store.get<string>('wineExtraEnv', ''));
    this.spawnBridge(dllWinPath, 31594, winePrefix, wineBin, extraEnv);
  }

  /**
   * Parses a whitespace-separated list of KEY=VALUE pairs into an env record.
   * e.g. "WINESYNC=1 WINEFSYNC=1" → { WINESYNC: '1', WINEFSYNC: '1' }
   * Entries that don't match KEY=VALUE are silently ignored.
   */
  private parseWineExtraEnv(raw: string): Record<string, string> {
    const result: Record<string, string> = {};
    for (const token of raw.trim().split(/\s+/)) {
      const eq = token.indexOf('=');
      if (eq > 0) {
        result[token.slice(0, eq)] = token.slice(eq + 1);
      }
    }
    return result;
  }

  private registerWinePathIpc(region: Region): void {
    // Combined handler: resolves once and sends both prefix and bin values.
    // Used on initial settings load and after resetting both paths together.
    ipcMain.on('bridge:winepaths:get', (event) => {
      const paths = this.wineResolver.resolveWinePaths();
      event.sender.send('bridge:wineprefix:value', {
        resolved: paths.prefix,
        custom: this.store.get<string | null>('winePrefix', null)
      });
      event.sender.send('bridge:winebin:value', {
        resolved: paths.bin,
        custom: this.store.get<string | null>('wineBin', null)
      });
    });

    ipcMain.on('bridge:winepaths:reset', (event) => {
      this.store.delete('winePrefix');
      this.store.delete('wineBin');
      const paths = this.wineResolver.resolveWinePaths();
      event.sender.send('bridge:wineprefix:value', {
        resolved: paths.prefix,
        custom: null
      });
      event.sender.send('bridge:winebin:value', {
        resolved: paths.bin,
        custom: null
      });
      if (this.captureInterface) {
        try {
          this.startBridge(region);
        } catch (e) {
          log.error('[bridge] Failed to restart bridge after settings change:', e);
        }
      }
    });

    ipcMain.on('bridge:wineprefix:get', (event) => {
      event.sender.send('bridge:wineprefix:value', {
        resolved: this.wineResolver.resolveWinePaths().prefix,
        custom: this.store.get<string | null>('winePrefix', null)
      });
    });

    ipcMain.on('bridge:wineprefix:set', (event) => {
      const current = this.wineResolver.resolveWinePaths().prefix;
      const opts: OpenDialogOptions = {
        defaultPath: current ?? app.getPath('home'),
        properties: ['openDirectory']
      };
      dialog.showOpenDialog(this.mainWindow.win, opts).then((result) => {
        if (result.canceled) return;
        this.store.set('winePrefix', result.filePaths[0]);
        event.sender.send('bridge:wineprefix:value', {
          resolved: this.wineResolver.resolveWinePaths().prefix,
          custom: this.store.get<string | null>('winePrefix', null)
        });
        if (this.captureInterface) {
          try {
            this.startBridge(region);
          } catch (e) {
            log.error('[bridge] Failed to restart bridge after settings change:', e);
          }
        }
      });
    });


    ipcMain.on('bridge:winebin:get', (event) => {
      event.sender.send('bridge:winebin:value', {
        resolved: this.wineResolver.resolveWinePaths().bin,
        custom: this.store.get<string | null>('wineBin', null)
      });
    });

    ipcMain.on('bridge:winebin:set', (event) => {
      const current = this.wineResolver.resolveWinePaths().bin;
      const opts: OpenDialogOptions = {
        defaultPath: current ? join(current, '..') : app.getPath('home'),
        properties: ['openFile']
      };
      dialog.showOpenDialog(this.mainWindow.win, opts).then((result) => {
        if (result.canceled) return;
        this.store.set('wineBin', result.filePaths[0]);
        event.sender.send('bridge:winebin:value', {
          resolved: this.wineResolver.resolveWinePaths().bin,
          custom: this.store.get<string | null>('wineBin', null)
        });
        if (this.captureInterface) {
          try {
            this.startBridge(region);
          } catch (e) {
            log.error('[bridge] Failed to restart bridge after settings change:', e);
          }
        }
      });
    });

    ipcMain.on('bridge:wineenv:get', (event) => {
      event.sender.send('bridge:wineenv:value', this.store.get<string>('wineExtraEnv', ''));
    });

    ipcMain.on('bridge:wineenv:set', (event, value: string) => {
      this.store.set('wineExtraEnv', value ?? '');
      event.sender.send('bridge:wineenv:value', this.store.get<string>('wineExtraEnv', ''));
      if (this.captureInterface) {
        try {
          this.startBridge(region);
        } catch (e) {
          log.error('[bridge] Failed to restart bridge after settings change:', e);
        }
      }
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
        const { prefix: winePrefix, bin: wineBin } = this.wineResolver.resolveWinePaths();

        if (!winePrefix || !wineBin) {
          log.error('[pcap] Wine paths could not be resolved (not configured and autodetection failed):', { winePrefix, wineBin });
          this.store.set('machina', false);
          this.mainWindow.win.webContents.send('toggle-pcap:value', false);
          this.mainWindow.win.webContents.send('pcap:status', 'error');
          this.mainWindow.win.webContents.send('pcap:error', { message: 'BRIDGE_PATHS_NOT_CONFIGURED' });
          return;
        }

        // Steam's Proton session prevents the game from booting if the bridge
        // (Wine) starts before ffxiv_dx11.exe is already running. XIVLauncher
        // manages its own Wine session and doesn't have this constraint.
        if (this.wineResolver.detectAutoSource() === 'steam' && !this.isGameRunningViaWine()) {
          log.error('[pcap] ffxiv_dx11.exe is not running; refusing to start bridge under Steam Proton');
          this.store.set('machina', false);
          this.mainWindow.win.webContents.send('toggle-pcap:value', false);
          this.mainWindow.win.webContents.send('pcap:status', 'error');
          this.mainWindow.win.webContents.send('pcap:error', { message: 'BRIDGE_GAME_NOT_RUNNING' });
          return;
        }

        // deucalion-bridge.exe runs under Wine and forwards the deucalion
        // named pipe over TCP.
        try {
          this.startBridge(region);
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
        options.deucalionDllPath = this.getDeucalionDllPath(region);
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
  private getDeucalionDllPath(region: Region): string {
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

    const extraEnvStr = Object.entries(extraEnv).map(([k, v]) => `${k}=${v}`).join(' ');
    log.info(`[bridge] spawning: ${extraEnvStr ? `${extraEnvStr} ` : ''}${wineBin} ${bridgeExe} --dll-path ${dllWinPath} --port ${port}`);

    this.bridgeProcess = spawn(wineBin, [bridgeExe, '--dll-path', dllWinPath, '--port', String(port)], {
      env: { ...process.env, WINEPREFIX: winePrefix, ...this.getMacWineSyncEnv(), ...extraEnv }
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
      // We only ever kill the bridge ourselves with the default SIGTERM, so any other
      // signal (e.g. SIGFPE, SIGSEGV) means it actually crashed, not that we stopped it.
      if (((code !== null && code !== 0) || (signal !== null && signal !== 'SIGTERM')) && this.captureInterface) {
        log.error(`[bridge] Abnormal exit (stderr: ${stderrBuffer.trim()})`);
        this.store.set('machina', false);
        this.mainWindow.win.webContents.send('toggle-pcap:value', false);
        this.mainWindow.win.webContents.send('pcap:status', 'error');
        this.mainWindow.win.webContents.send('pcap:error', { message: 'BRIDGE_CRASHED' });
        this.stop();
      }
    });
  }

}
