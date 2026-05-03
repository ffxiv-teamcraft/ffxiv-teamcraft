import { MainWindow } from '../window/main-window';
import { Store } from '../store';
import { join, resolve } from 'path';
import { existsSync, readFileSync, readdirSync } from 'fs';
import { spawn, ChildProcess } from 'child_process';
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

    if (process.platform === 'linux') {
      this.registerLinuxPathIpc();
    }
  }

  /**
   * Restarts the deucalion bridge with the current resolved paths if packet
   * capture is already active. Called after any Linux path setting changes.
   */
  private restartBridgeIfActive(): void {
    if (!this.captureInterface) return;
    const winePrefix = this.resolveWinePrefix();
    const wineBin = this.resolveWineBin();
    if (!winePrefix || !wineBin) {
      log.warn('[bridge] Cannot restart bridge: paths still unresolved after settings change');
      return;
    }
    try {
      const dllWinPath = this.toWinePath(this.getDeucalionDllPath());
      this.spawnBridge(dllWinPath, 31594, winePrefix, wineBin);
    } catch (e) {
      log.error('[bridge] Failed to restart bridge after settings change:', e);
    }
  }

  private registerLinuxPathIpc(): void {
    ipcMain.on('linux:wineprefix:get', (event) => {
      event.sender.send('linux:wineprefix:value', {
        resolved: this.resolveWinePrefix(),
        custom: this.store.get<string | null>('winePrefix', null)
      });
    });

    ipcMain.on('linux:wineprefix:set', (event) => {
      const current = this.resolveWinePrefix();
      const opts: OpenDialogOptions = {
        defaultPath: current ?? app.getPath('home'),
        properties: ['openDirectory']
      };
      dialog.showOpenDialog(this.mainWindow.win, opts).then((result) => {
        if (result.canceled) return;
        this.store.set('winePrefix', result.filePaths[0]);
        event.sender.send('linux:wineprefix:value', {
          resolved: this.resolveWinePrefix(),
          custom: this.store.get<string | null>('winePrefix', null)
        });
        this.restartBridgeIfActive();
      });
    });

    ipcMain.on('linux:wineprefix:reset', (event) => {
      this.store.delete('winePrefix');
      event.sender.send('linux:wineprefix:value', {
        resolved: this.resolveWinePrefix(),
        custom: null
      });
      this.restartBridgeIfActive();
    });

    ipcMain.on('linux:winebin:get', (event) => {
      event.sender.send('linux:winebin:value', {
        resolved: this.resolveWineBin(),
        custom: this.store.get<string | null>('wineBin', null)
      });
    });

    ipcMain.on('linux:winebin:set', (event) => {
      const current = this.resolveWineBin();
      const opts: OpenDialogOptions = {
        defaultPath: current ? join(current, '..') : app.getPath('home'),
        properties: ['openFile']
      };
      dialog.showOpenDialog(this.mainWindow.win, opts).then((result) => {
        if (result.canceled) return;
        this.store.set('wineBin', result.filePaths[0]);
        event.sender.send('linux:winebin:value', {
          resolved: this.resolveWineBin(),
          custom: this.store.get<string | null>('wineBin', null)
        });
        this.restartBridgeIfActive();
      });
    });

    ipcMain.on('linux:winebin:reset', (event) => {
      this.store.delete('wineBin');
      event.sender.send('linux:winebin:value', {
        resolved: this.resolveWineBin(),
        custom: null
      });
      this.restartBridgeIfActive();
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

      if (process.platform === 'linux') {
        // Validate all three Linux-specific paths before attempting bridge setup.
        // If any cannot be resolved, disable pcap and ask the user to configure them.
        const winePrefix = this.resolveWinePrefix();
        const wineBin = this.resolveWineBin();
        const configDir = this.resolveConfigDir();

        if (!winePrefix || !wineBin || !configDir) {
          log.error('[pcap] One or more Linux paths could not be resolved:', { winePrefix, wineBin, configDir });
          this.store.set('machina', false);
          this.mainWindow.win.webContents.send('toggle-pcap:value', false);
          this.mainWindow.win.webContents.send('pcap:status', 'error');
          this.mainWindow.win.webContents.send('pcap:error', { message: 'LINUX_PATHS_NOT_CONFIGURED' });
          return;
        }

        // On Linux, deucalion-bridge.exe runs under Wine and forwards the deucalion
        // named pipe over TCP.
        try {
          const dllWinPath = this.toWinePath(this.getDeucalionDllPath());
          this.spawnBridge(dllWinPath, 31594, winePrefix, wineBin);
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
          message: "MISSING_INJECTOR"
        });
        log.error("[pcap] MISSING_INJECTOR");
      } else {
        log.error(e)
      }
    }
  }

  /**
   * Resolves the Wine prefix directory.
   * Order: manual store override → Steam compatdata → XIVLauncher protonprefix → XIVLauncher wineprefix → null
   */
  /**
   * Determines which installation manages the FFXIV Wine environment.
   * Steam is identified by the presence of Proton's initialized FFXIV prefix
   * (compatdata/39210/pfx), which only exists after the game has actually been
   * launched through Proton. XIVLauncher is identified by ~/.xlcore existing.
   * Returns null if neither can be found.
   */
  private detectAutoSource(): 'steam' | 'xlcore' | null {
    const home = app.getPath('home');
    const steamPrefix = join(home, '.local', 'share', 'Steam', 'steamapps', 'compatdata', '39210', 'pfx');
    if (existsSync(steamPrefix)) return 'steam';
    if (existsSync(join(home, '.xlcore'))) return 'xlcore';
    return null;
  }

  private resolveWinePrefix(): string | null {
    const custom = this.store.get<string | null>('winePrefix', null);
    if (custom && existsSync(custom)) return custom;

    const home = app.getPath('home');
    const source = this.detectAutoSource();

    if (source === 'steam') {
      return join(home, '.local', 'share', 'Steam', 'steamapps', 'compatdata', '39210', 'pfx');
    }

    if (source === 'xlcore') {
      const p = join(home, '.xlcore', 'wineprefix');
      if (existsSync(p)) return p;
    }

    return null;
  }

  /**
   * Resolves the Wine binary path.
   * The source (Steam or XIVLauncher) is determined once by detectAutoSource() so that
   * all three Linux paths always come from the same installation.
   *
   * XIVLauncher downloads managed wine to ~/.xlcore/compatibilitytool/wine/<version>/bin/.
   * Custom setups store the bin directory in RB_WineBinaryPath (current) or the legacy
   * WineBinaryPath key in launcher.ini.
   */
  private resolveWineBin(): string | null {
    const custom = this.store.get<string | null>('wineBin', null);
    if (custom && existsSync(custom)) return custom;

    const home = app.getPath('home');
    const source = this.detectAutoSource();

    if (source === 'steam') {
      const steamCommon = join(home, '.local', 'share', 'Steam', 'steamapps', 'common');
      try {
        const protonDirs = readdirSync(steamCommon)
          .filter(d => d.toLowerCase().startsWith('proton'))
          .sort()
          .reverse();
        for (const dir of protonDirs) {
          for (const subpath of ['dist/bin/wine', 'files/bin/wine']) {
            const candidate = join(steamCommon, dir, subpath);
            if (existsSync(candidate)) {
              log.info(`[bridge] Using Wine from Steam Proton: ${candidate}`);
              return candidate;
            }
          }
        }
      } catch {
        // steamapps/common unreadable
      }
      return null;
    }

    if (source === 'xlcore') {
      // XIVLauncher custom binary path from launcher.ini takes priority over managed wine.s
      const iniPath = join(home, '.xlcore', 'launcher.ini');
      if (existsSync(iniPath)) {
        try {
          const contents = readFileSync(iniPath, 'utf8');
          const iniValues: Record<string, string> = {};
          for (const line of contents.split(/\r?\n/)) {
            const m = line.match(/^([^=]+)=(.+)$/);
            if (m) iniValues[m[1].trim()] = m[2].trim();
          }
          const binDir = iniValues['RB_WineBinaryPath'] ?? iniValues['WineBinaryPath'];
          if (binDir) {
            const candidate = join(binDir, 'wine');
            if (existsSync(candidate)) {
              log.info(`[bridge] Using Wine from XIVLauncher config: ${candidate}`);
              return candidate;
            }
          }
        } catch {
          // launcher.ini unreadable
        }
      }

      // Fall back to XIVLauncher managed wine: ~/.xlcore/compatibilitytool/wine/<version>/bin/wine
      const managedWineDir = join(home, '.xlcore', 'compatibilitytool', 'wine');
      if (existsSync(managedWineDir)) {
        try {
          const versions = readdirSync(managedWineDir).sort().reverse();
          for (const version of versions) {
            const candidate = join(managedWineDir, version, 'bin', 'wine');
            if (existsSync(candidate)) {
              log.info(`[bridge] Using Wine from XIVLauncher managed: ${candidate}`);
              return candidate;
            }
          }
        } catch {
          // unreadable
        }
      }
    }

    return null;
  }

  /**
   * Resolves the FFXIV config directory (where CHRXXXXXXX folders live).
   * Uses the same source as the other Linux resolvers (Steam or XIVLauncher).
   */
  private resolveConfigDir(): string | null {
    const custom = this.store.get<string | null>('dat-watcher:dir', null);
    if (custom && existsSync(custom)) return custom;

    const home = app.getPath('home');
    const source = this.detectAutoSource();

    if (source === 'steam') {
      const steamPrefix = join(home, '.local', 'share', 'Steam', 'steamapps', 'compatdata', '39210', 'pfx');
      for (const docs of ['Documents', 'My Documents']) {
        const p = join(steamPrefix, 'drive_c', 'users', 'steamuser', docs, 'My Games', 'FINAL FANTASY XIV - A Realm Reborn');
        if (existsSync(p)) return p;
      }
      return null;
    }

    if (source === 'xlcore') {
      const xlcorePath = join(home, '.xlcore', 'ffxivConfig');
      if (existsSync(xlcorePath)) return xlcorePath;
    }

    return null;
  }

  /**
   * Walks up the directory tree from __dirname to find deucalion.dll inside
   * node_modules. This is necessary in dev/unpackaged builds because webpack
   * compiles require.resolve() to a numeric module ID rather than a real path.
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
   * Returns the native (Linux/Windows) path to the bundled deucalion.dll.
   * Packaged builds find it in extraFiles next to the app; dev builds walk up
   * from __dirname to locate it inside node_modules.
   */
  private getDeucalionDllPath(): string {
    if (app.isPackaged) {
      return join(app.getAppPath(), '../../deucalion/deucalion.dll');
    }
    return this.findDevDeucalionDll();
  }

  /**
   * Converts a Linux absolute path to a Wine Z: drive path.
   * Wine's Z: drive maps directly to the Linux root filesystem.
   */
  private toWinePath(linuxPath: string): string {
    return 'Z:' + linuxPath.replace(/\//g, '\\');
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
  private spawnBridge(dllWinPath: string, port: number, winePrefix: string, wineBin: string): void {
    if (this.bridgeProcess) {
      this.bridgeProcess.kill();
      this.bridgeProcess = null;
    }

    const bridgeExe = app.isPackaged
      ? join(app.getAppPath(), '../../deucalion-bridge.exe')
      : join(__dirname, '../../../tools/build/deucalion-bridge.exe');

    log.info(`[bridge] spawning: ${wineBin} ${bridgeExe} --dll-path ${dllWinPath} --port ${port}`);

    this.bridgeProcess = spawn(wineBin, [bridgeExe, '--dll-path', dllWinPath, '--port', String(port)], {
      env: { ...process.env, WINEPREFIX: winePrefix }
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
        this.mainWindow.win.webContents.send('pcap:error', { message: 'LINUX_BRIDGE_ERROR' });
        this.stop();
      }
    });
  }

}
