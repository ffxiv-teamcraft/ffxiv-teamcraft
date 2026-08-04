import { join } from 'path';
import { existsSync, readdirSync, readFileSync } from 'fs';
import log from 'electron-log';
import { app } from 'electron';
import { Store } from '../store';

/**
 * Resolves the Wine prefix and binary paths needed to run deucalion-bridge
 * on Linux and macOS. Supports three launchers:
 *   - Steam (Proton / Proton-GE / custom compat tools)
 *   - XIVLauncher Core (~/.xlcore)
 *   - XIV on Mac (fixed install location, macOS only)
 *
 * The primary API is resolveWinePaths(), which detects the active launcher
 * once and returns both paths from that same source. This ensures the prefix
 * and binary always come from the same Wine installation.
 *
 * User-supplied overrides stored in the Electron store take priority over
 * autodetection for each path independently.
 */
export class WineResolver {
  constructor(private store: Store) {}

  /**
   * Detects which launcher manages the FFXIV Wine environment.
   * On macOS, XIV on Mac is identified by its wine prefix in Application Support.
   * Steam is identified by an initialized Proton prefix for FFXIV (appid 39210),
   * which only exists after the game has been launched through Steam at least once.
   * XIVLauncher is identified by the presence of ~/.xlcore.
   * Returns null if none is found.
   */
  detectAutoSource(): 'steam' | 'xlcore' | 'xivonmac' | null {
    const home = app.getPath('home');
    if (process.platform === 'darwin') {
      return existsSync(this.xivOnMacPrefix(home)) ? 'xivonmac' : null;
    }
    const steamPrefix = join(home, '.local', 'share', 'Steam', 'steamapps', 'compatdata', '39210', 'pfx');
    if (existsSync(steamPrefix)) return 'steam';
    if (existsSync(join(home, '.xlcore'))) return 'xlcore';
    return null;
  }

  /**
   * Resolves the Wine prefix and binary as a matched pair from the same
   * launcher source. detectAutoSource() is called exactly once so both paths
   * always come from the same installation.
   *
   * User overrides from the Electron store take priority over autodetection
   * for each path independently.
   */
  resolveWinePaths(): { prefix: string | null; bin: string | null } {
    const customPrefix = this.store.get<string | null>('winePrefix', null);
    const customBin = this.store.get<string | null>('wineBin', null);

    const home = app.getPath('home');
    const source = this.detectAutoSource();

    return {
      prefix: (customPrefix && existsSync(customPrefix)) ? customPrefix : this.detectPrefix(source, home),
      bin: (customBin && existsSync(customBin)) ? customBin : this.detectBin(source, home)
    };
  }

  // ---------------------------------------------------------------------------
  // Source-specific prefix/binary detectors
  // ---------------------------------------------------------------------------

  private detectPrefix(source: 'steam' | 'xlcore' | 'xivonmac' | null, home: string): string | null {
    if (source === 'steam') {
      const p = join(home, '.local', 'share', 'Steam', 'steamapps', 'compatdata', '39210', 'pfx');
      if (existsSync(p)) return p;
    }
    if (source === 'xlcore') {
      const p = join(home, '.xlcore', 'wineprefix');
      if (existsSync(p)) return p;
    }
    if (source === 'xivonmac') {
      const p = this.xivOnMacPrefix(home);
      if (existsSync(p)) return p;
    }
    return null;
  }

  private detectBin(source: 'steam' | 'xlcore' | 'xivonmac' | null, home: string): string | null {
    if (source === 'steam') {
      const steamRoot = join(home, '.local', 'share', 'Steam');
      return this.findSteamProtonWineBin(steamRoot);
    }
    if (source === 'xlcore') {
      return this.findXlcoreWineBin(home);
    }
    if (source === 'xivonmac') {
      const bin = '/Applications/XIV on Mac.app/Contents/Resources/wine/bin/wine';
      if (existsSync(bin)) {
        log.info(`[bridge] Auto-detected Wine from XIV on Mac: ${bin}`);
        return bin;
      }
    }
    return null;
  }

  /**
   * XIV on Mac installs to fixed locations: the app bundle in /Applications
   * and the wine prefix under ~/Library/Application Support.
   */
  private xivOnMacPrefix(home: string): string {
    return join(home, 'Library', 'Application Support', 'XIV on Mac', 'wineprefix');
  }

  // ---------------------------------------------------------------------------
  // XIVLauncher binary resolution
  // ---------------------------------------------------------------------------

  /**
   * Resolves the Wine binary for XIVLauncher by reading launcher.ini.
   *
   * launcher.ini contains two independent key sets: unprefixed keys for
   * standard XIVLauncher and RB_-prefixed keys for the RB fork. Each set
   * has its own WineStartupType. Supported modes:
   *   Custom  – explicit bin directory in WineBinaryPath / RB_WineBinaryPath
   *   Managed – a named wine build under ~/.xlcore/compatibilitytool/wine/
   *   Proton  – (RB fork only) a Proton/GE-Proton tool from Steam's
   *             compatibilitytools.d, named in RB_ProtonVersion
   *
   * Priority: all RB_* settings → all standard settings → directory scan.
   * When RB_WineStartupType is present the user is running the RB fork, so
   * its keys are authoritative and evaluated in full before falling back to
   * the standard XIVLauncher key set. This prevents a stale standard setting
   * (e.g. WineStartupType=Custom from a previous session) from shadowing the
   * active RB selection.
   *
   * ~/.xlcore is a symlink to the XDG data directory used by the RB fork
   * (~/.local/share/dev.goats.xivlauncher), so both launchers share the same
   * on-disk wine store and no separate path derivation is needed.
   */
  private findXlcoreWineBin(home: string): string | null {
    const wineBaseDir = join(home, '.xlcore', 'compatibilitytool', 'wine');
    const iniPath = join(home, '.xlcore', 'launcher.ini');

    if (existsSync(iniPath)) {
      try {
        const contents = readFileSync(iniPath, 'utf8');
        const iniValues: Record<string, string> = {};
        for (const line of contents.split(/\r?\n/)) {
          const m = line.match(/^([^=]+)=(.+)$/);
          if (m) iniValues[m[1].trim()] = m[2].trim();
        }

        // ── RB fork block ─────────────────────────────────────────────────
        // If RB_WineStartupType is present the user runs the RB fork.
        // Evaluate all RB_* settings before touching standard keys.
        if (iniValues['RB_WineStartupType']) {
          // 1a. RB Proton mode: find the named tool in Steam's compat dirs
          if (iniValues['RB_WineStartupType'] === 'Proton' && iniValues['RB_ProtonVersion']) {
            const protonVersion = iniValues['RB_ProtonVersion'];
            const steamRoot = join(home, '.local', 'share', 'Steam');
            const bin = this.findProtonWineBinByToolName(steamRoot, protonVersion);
            if (bin) {
              log.info(`[bridge] Auto-detected Wine from XIVLauncher RB Proton selection (${protonVersion}): ${bin}`);
              return bin;
            }
          }

          // 1b. RB Custom mode: explicit binary directory
          if (iniValues['RB_WineStartupType'] === 'Custom' && iniValues['RB_WineBinaryPath']) {
            const candidate = join(iniValues['RB_WineBinaryPath'], 'wine');
            if (existsSync(candidate)) {
              log.info(`[bridge] Auto-detected Wine from XIVLauncher RB custom config: ${candidate}`);
              return candidate;
            }
          }

          // 1c. RB Managed mode: use the version name to find the exact directory.
          // If the version isn't installed yet (XIVLauncher downloads it on first
          // game launch), return null rather than silently using a stale version
          // from a previous session.
          if (iniValues['RB_WineStartupType'] === 'Managed') {
            if (iniValues['RB_WineVersion']) {
              const versionDir = join(wineBaseDir, iniValues['RB_WineVersion']);
              for (const exe of ['bin/wine64', 'bin/wine']) {
                const candidate = join(versionDir, exe);
                if (existsSync(candidate)) {
                  log.info(`[bridge] Auto-detected Wine from XIVLauncher RB managed version (${iniValues['RB_WineVersion']}): ${candidate}`);
                  return candidate;
                }
              }
              log.warn(`[bridge] XIVLauncher RB managed wine '${iniValues['RB_WineVersion']}' not installed yet; launch the game through XIVLauncher to download it`);
              return null;
            }
            // No version configured; return null.
            return null;
          }
        }

        // ── Standard XIVLauncher block ────────────────────────────────────
        // 2a. Custom mode: explicit binary directory
        if (iniValues['WineStartupType'] === 'Custom' && iniValues['WineBinaryPath']) {
          const candidate = join(iniValues['WineBinaryPath'], 'wine');
          if (existsSync(candidate)) {
            log.info(`[bridge] Auto-detected Wine from XIVLauncher custom config: ${candidate}`);
            return candidate;
          }
        }

        // 2b. Managed: use the explicitly stored version name
        if (iniValues['WineManagedVersion']) {
          const versionDir = join(wineBaseDir, iniValues['WineManagedVersion']);
          for (const exe of ['bin/wine64', 'bin/wine']) {
            const candidate = join(versionDir, exe);
            if (existsSync(candidate)) {
              log.info(`[bridge] Auto-detected Wine from XIVLauncher managed version (${iniValues['WineManagedVersion']}): ${candidate}`);
              return candidate;
            }
          }
        }
      } catch {
        // launcher.ini unreadable
      }
    }

    // Last resort: scan the managed wine directory for the newest version
    return this.scanManagedWineDir(wineBaseDir);
  }

  /**
   * Scans a managed wine directory and returns the binary from the newest
   * installed version, or null if the directory is empty or unreadable.
   */
  private scanManagedWineDir(dir: string): string | null {
    if (!existsSync(dir)) return null;
    try {
      const versions = readdirSync(dir).sort().reverse();
      for (const version of versions) {
        for (const exe of ['bin/wine64', 'bin/wine']) {
          const candidate = join(dir, version, exe);
          if (existsSync(candidate)) {
            log.info(`[bridge] Auto-detected Wine from XIVLauncher managed (scan): ${candidate}`);
            return candidate;
          }
        }
      }
    } catch {
      // unreadable
    }
    return null;
  }

  // ---------------------------------------------------------------------------
  // Steam binary resolution
  // ---------------------------------------------------------------------------

  /**
   * Finds the wine binary for the compatibility tool Steam has configured for
   * FFXIV. Reads config.vdf to get the tool name, then searches for it in
   * compatibilitytools.d and across all Steam library paths. Falls back to a
   * Proton directory scan if the configured tool can't be located.
   */
  private findSteamProtonWineBin(steamRoot: string): string | null {
    const configuredTool = this.readSteamCompatToolForApp(steamRoot, '39210');
    if (configuredTool) {
      const bin = this.findProtonWineBinByToolName(steamRoot, configuredTool);
      if (bin) {
        log.info(`[bridge] Auto-detected Wine from Steam compat tool '${configuredTool}': ${bin}`);
        return bin;
      }
      log.warn(`[bridge] Could not locate wine binary for Steam compat tool '${configuredTool}', falling back to scan`);
    }
    return this.scanForNewestProtonWineBin(steamRoot);
  }

  /**
   * Parses Steam's config.vdf to find which compatibility tool is configured
   * for a given Steam app ID. Returns the internal tool name (e.g.
   * "proton_experimental", "GE-Proton9-20") or null if not found.
   */
  private readSteamCompatToolForApp(steamRoot: string, appId: string): string | null {
    const configPath = join(steamRoot, 'config', 'config.vdf');
    if (!existsSync(configPath)) return null;
    try {
      const contents = readFileSync(configPath, 'utf8');
      // The CompatToolMapping block contains one entry per app; each entry only
      // has simple key-value pairs so [^}]* safely matches the whole block.
      const match = contents.match(
        new RegExp(`"${appId}"\\s*\\{[^}]*"name"\\s+"([^"]+)"`)
      );
      return match?.[1] ?? null;
    } catch {
      return null;
    }
  }

  /**
   * Returns all directories that Steam searches for third-party compatibility
   * tools (Proton-GE, system-installed Proton forks, etc.).
   * Includes the user-specific path, common system-wide paths, and any path
   * declared in the STEAM_EXTRA_COMPAT_TOOLS_PATHS environment variable.
   */
  private getCompatToolDirs(steamRoot: string): string[] {
    const dirs: string[] = [
      join(steamRoot, 'compatibilitytools.d'),
      '/usr/share/steam/compatibilitytools.d',
      '/usr/lib/steam/compatibilitytools.d',
    ];

    const extra = process.env['STEAM_EXTRA_COMPAT_TOOLS_PATHS'];
    if (extra) {
      for (const p of extra.split(':')) {
        if (p && !dirs.includes(p)) dirs.push(p);
      }
    }

    return dirs.filter(existsSync);
  }

  /**
   * Locates the wine binary for a given Steam compatibility tool name.
   * Checks all compatibility tool directories (user + system-wide) first,
   * then maps Valve Proton tool names to their directory names and searches
   * all Steam library paths.
   */
  private findProtonWineBinByToolName(steamRoot: string, toolName: string): string | null {
    // Third-party tools (Proton-GE, system Proton forks, etc.) live in
    // compatibilitytools.d directories under their internal name
    for (const compatDir of this.getCompatToolDirs(steamRoot)) {
      const toolDir = join(compatDir, toolName);
      if (existsSync(toolDir)) {
        return this.findWineBinInProtonDir(toolDir);
      }
    }

    // Valve Proton tool names map to directory names in steamapps/common
    const dirName = this.valveProtonToolNameToDir(toolName);
    for (const libPath of this.readSteamLibraryPaths(steamRoot)) {
      const protonDir = join(libPath, 'steamapps', 'common', dirName);
      if (existsSync(protonDir)) {
        return this.findWineBinInProtonDir(protonDir);
      }
    }

    return null;
  }

  /**
   * Maps a Valve Proton internal tool name to its steamapps/common directory name.
   * e.g. "proton_experimental" → "Proton - Experimental"
   *      "proton_9"            → "Proton 9.0"
   *      "proton_hotfix"       → "Proton Hotfix"
   */
  private valveProtonToolNameToDir(toolName: string): string {
    if (toolName === 'proton_experimental') return 'Proton - Experimental';
    if (toolName === 'proton_hotfix') return 'Proton Hotfix';
    const m = toolName.match(/^proton_(\d+)$/);
    if (m) return `Proton ${m[1]}.0`;
    // Return the tool name unchanged as a last-ditch attempt
    return toolName;
  }

  /**
   * Returns all Steam library root paths by parsing libraryfolders.vdf.
   * Always includes steamRoot itself as the default library.
   */
  private readSteamLibraryPaths(steamRoot: string): string[] {
    const paths: string[] = [steamRoot];
    const vdfPath = join(steamRoot, 'config', 'libraryfolders.vdf');
    if (!existsSync(vdfPath)) return paths;
    try {
      const contents = readFileSync(vdfPath, 'utf8');
      for (const match of contents.matchAll(/"path"\s+"([^"]+)"/g)) {
        if (!paths.includes(match[1])) paths.push(match[1]);
      }
    } catch {
      // unreadable
    }
    return paths;
  }

  /**
   * Returns the wine binary path within a Proton installation directory,
   * checking both the modern (files/bin/) and legacy (dist/bin/) layouts.
   * Prefers wine64 over wine where both exist.
   */
  private findWineBinInProtonDir(protonDir: string): string | null {
    for (const subpath of ['files/bin/wine64', 'files/bin/wine', 'dist/bin/wine64', 'dist/bin/wine']) {
      const candidate = join(protonDir, subpath);
      if (existsSync(candidate)) return candidate;
    }
    return null;
  }

  /**
   * Fallback: scans all compatibility tool directories (user + system-wide)
   * and all Steam library paths for any Proton directory, returning the wine
   * binary from the most recently named one. Used only when the configured
   * compat tool cannot be resolved by name.
   */
  private scanForNewestProtonWineBin(steamRoot: string): string | null {
    // Scan third-party compat tool directories first
    for (const compatDir of this.getCompatToolDirs(steamRoot)) {
      try {
        const dirs = readdirSync(compatDir).sort().reverse();
        for (const dir of dirs) {
          const bin = this.findWineBinInProtonDir(join(compatDir, dir));
          if (bin) {
            log.info(`[bridge] Auto-detected Wine from compat tool directory (scan fallback): ${bin}`);
            return bin;
          }
        }
      } catch {
        // directory unreadable
      }
    }

    // Also scan steamapps/common for Valve Proton installations
    for (const libPath of this.readSteamLibraryPaths(steamRoot)) {
      const common = join(libPath, 'steamapps', 'common');
      try {
        const protonDirs = readdirSync(common)
          .filter(d => d.toLowerCase().startsWith('proton'))
          .sort()
          .reverse();
        for (const dir of protonDirs) {
          const bin = this.findWineBinInProtonDir(join(common, dir));
          if (bin) {
            log.info(`[bridge] Auto-detected Wine from Steam Proton (scan fallback): ${bin}`);
            return bin;
          }
        }
      } catch {
        // library path unreadable
      }
    }

    return null;
  }
}
