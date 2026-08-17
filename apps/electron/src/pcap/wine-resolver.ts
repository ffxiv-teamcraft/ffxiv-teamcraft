import { join } from 'path';
import { existsSync, readdirSync, readFileSync } from 'fs';
import log from 'electron-log';
import { app } from 'electron';
import { Store } from '../store';

/**
 * Resolves the Wine prefix and binary paths needed to run deucalion-bridge
 * on Linux. Supports three configurations:
 *   - Steam (Proton / Proton-GE / custom compat tools)
 *   - XIVLauncher Core (~/.xlcore or ~/.local/share/dev.goats.xivlauncher)
 *   - XIVLauncher as a Steam compatibility tool (XLM / XLM-RB / the old
 *     xlcore tool): the game runs in Steam's compatdata prefix, but with
 *     the Wine/Proton binary from XIVLauncher's own configuration
 *
 * The primary API is resolveWinePaths(), which detects the active launcher
 * once and returns both paths from that same source. This ensures the prefix
 * and binary always come from the same Wine installation.
 *
 * For XIVLauncher the prefix depends on the wine configuration in
 * launcher.ini: a Wine prefix (wineprefix) for Wine setups and a Proton
 * prefix (protonprefix) for Proton setups, mirroring the launcher's own
 * prefix selection. In the Steam compatibility tool case the prefix is
 * Steam's compatdata prefix instead: Steam sets WINEPREFIX/PROTONPREFIX
 * and the launcher honors them.
 *
 * User-supplied overrides stored in the Electron store take priority over
 * autodetection for each path independently.
 */
export class WineResolver {
  constructor(private store: Store) {}

  /**
   * Detects which launcher manages the FFXIV Wine environment.
   * Steam is identified by an initialized FFXIV compatibility prefix
   * (compatdata/39210/pfx) in any known Steam installation root, which only
   * exists after the game has been launched through Steam at least once —
   * including when XIVLauncher is used as a Steam compatibility tool (XLM),
   * where the game still runs inside Steam's compatdata prefix.
   * XIVLauncher is identified by its data directory (~/.xlcore or the XDG
   * data directory ~/.local/share/dev.goats.xivlauncher).
   * Returns null if neither is found.
   */
  detectAutoSource(): 'steam' | 'xlcore' | null {
    const home = app.getPath('home');
    if (this.getActiveSteamRoot(home)) return 'steam';
    if (this.getXlcoreRoot(home)) return 'xlcore';
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

  private detectPrefix(source: 'steam' | 'xlcore' | null, home: string): string | null {
    if (source === 'steam') {
      const steamRoot = this.getActiveSteamRoot(home);
      if (!steamRoot) return null;
      return join(steamRoot, 'steamapps', 'compatdata', '39210', 'pfx');
    }
    if (source === 'xlcore') {
      const root = this.getXlcoreRoot(home);
      if (!root) return null;
      const iniValues = this.readXlcoreIniValues(root);
      const proton = this.isXlcoreProtonConfig(iniValues);
      const p = join(root, proton ? 'protonprefix' : 'wineprefix');
      if (existsSync(p)) return p;
      if (proton) {
        log.warn(`[bridge] XIVLauncher is configured for Proton but its protonprefix does not exist yet; launch the game through XIVLauncher to create it`);
      }
    }
    return null;
  }

  /**
   * Resolves the Wine binary for a detected launcher source.
   *
   * The "steam" source has one subtlety: when Steam's configured
   * compatibility tool for FFXIV is one of the XIVLauncher tools (XLM /
   * XLM-RB / the old xlcore tool), the game is actually launched by
   * XIVLauncher. The prefix is still Steam's compatdata prefix (Steam sets
   * WINEPREFIX/PROTONPREFIX and the launcher honors them), but the Wine
   * binary is the one from XIVLauncher's own configuration, not Steam's
   * Proton tool.
   */
  private detectBin(source: 'steam' | 'xlcore' | null, home: string): string | null {
    if (source === 'steam') {
      const steamRoot = this.getActiveSteamRoot(home);
      if (!steamRoot) return null;
      const tool = this.readSteamCompatToolForApp(steamRoot, '39210');
      if (tool && this.isXivLauncherCompatTool(tool)) {
        log.info(`[bridge] FFXIV runs through the XIVLauncher Steam compat tool '${tool}'; using the launcher's wine configuration`);
        return this.findXlcoreWineBin(home);
      }
      return this.findSteamProtonWineBin(steamRoot);
    }
    if (source === 'xlcore') {
      return this.findXlcoreWineBin(home);
    }
    return null;
  }

  // ---------------------------------------------------------------------------
  // Installation root discovery
  // ---------------------------------------------------------------------------

  /**
   * Candidate Steam installation roots, most common first. Native Steam
   * (e.g. the Arch/Fedora/Debian packages) uses ~/.local/share/Steam;
   * Steam Deck uses ~/.steam/root.
   */
  private getSteamRoots(home: string): string[] {
    return [join(home, '.local', 'share', 'Steam'), join(home, '.steam', 'root')].filter(existsSync);
  }

  /**
   * The Steam root that has an initialized FFXIV compatibility prefix
   * (steamapps/compatdata/39210/pfx), i.e. the installation the game
   * actually runs in, or null if none.
   */
  private getActiveSteamRoot(home: string): string | null {
    for (const root of this.getSteamRoots(home)) {
      if (existsSync(join(root, 'steamapps', 'compatdata', '39210', 'pfx'))) return root;
    }
    return null;
  }

  /**
   * XIVLauncher's data directory: ~/.xlcore (a symlink or real directory
   * created by the installers) or the XDG data directory
   * (~/.local/share/dev.goats.xivlauncher) when there is no ~/.xlcore, e.g.
   * for XLM Steam compatibility tool installs. Null if neither exists.
   */
  private getXlcoreRoot(home: string): string | null {
    for (const root of [join(home, '.xlcore'), join(home, '.local', 'share', 'dev.goats.xivlauncher')]) {
      if (existsSync(root)) return root;
    }
    return null;
  }

  /**
   * Whether a Steam compat tool name (as recorded in config.vdf's
   * CompatToolMapping) is one of the XIVLauncher tools: XLM ("xlm"), the
   * XLM RB variant ("xlm-rb"), or the old self-contained tool ("xlcore").
   */
  private isXivLauncherCompatTool(toolName: string): boolean {
    return /^(xlm(-rb)?|xlcore)$/.test(toolName.toLowerCase());
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
   *             (RB: a Proton distribution root is also accepted; its
   *             standalone wine binary is used, as with Steam's Proton)
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
   * on-disk wine store; when there is no ~/.xlcore (e.g. XLM compatibility
   * tool installs) the XDG directory is used directly.
   *
   * When the active mode is Proton the matching prefix is
   * ~/.xlcore/protonprefix instead of ~/.xlcore/wineprefix (see
   * detectPrefix()), which applies the same mode detection.
   */
  private findXlcoreWineBin(home: string): string | null {
    const root = this.getXlcoreRoot(home);
    if (!root) return null;
    const wineBaseDir = join(root, 'compatibilitytool', 'wine');
    const iniValues = this.readXlcoreIniValues(root);

    // ── RB fork block ─────────────────────────────────────────────────
    // If RB_WineStartupType is present the user runs the RB fork.
    // Evaluate all RB_* settings before touching standard keys.
    if (iniValues['RB_WineStartupType']) {
      // 1a. RB Proton mode: find the named tool in Steam's compat dirs
      if (iniValues['RB_WineStartupType'] === 'Proton' && iniValues['RB_ProtonVersion']) {
        const protonVersion = iniValues['RB_ProtonVersion'];
        for (const steamRoot of this.getSteamRoots(home)) {
          const bin = this.findProtonWineBinByToolName(steamRoot, protonVersion);
          if (bin) {
            log.info(`[bridge] Auto-detected Wine from XIVLauncher RB Proton selection (${protonVersion}): ${bin}`);
            return bin;
          }
        }
      }

      // 1b. RB Custom mode: explicit binary directory. A wine build is
      // addressed by its bin directory (contains wine/wine64); a Proton
      // distribution is addressed by its root (contains the `proton`
      // wrapper), in which case the standalone wine binary lives in the
      // same layout as Steam's Proton installations.
      if (iniValues['RB_WineStartupType'] === 'Custom' && iniValues['RB_WineBinaryPath']) {
        const customPath = iniValues['RB_WineBinaryPath'];
        const candidate = join(customPath, 'wine');
        if (existsSync(candidate)) {
          log.info(`[bridge] Auto-detected Wine from XIVLauncher RB custom config: ${candidate}`);
          return candidate;
        }
        if (existsSync(join(customPath, 'proton'))) {
          const bin = this.findWineBinInProtonDir(customPath);
          if (bin) {
            log.info(`[bridge] Auto-detected Wine from XIVLauncher RB custom Proton distro: ${bin}`);
            return bin;
          }
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

    // Last resort: scan the managed wine directory for the newest version
    return this.scanManagedWineDir(wineBaseDir);
  }

  /**
   * Parses launcher.ini from XIVLauncher's data directory into a flat
   * key/value map. Returns an empty object when the file is missing or
   * unreadable.
   */
  private readXlcoreIniValues(root: string): Record<string, string> {
    const iniPath = join(root, 'launcher.ini');
    if (!existsSync(iniPath)) return {};
    try {
      const contents = readFileSync(iniPath, 'utf8');
      const values: Record<string, string> = {};
      for (const line of contents.split(/\r?\n/)) {
        const m = line.match(/^([^=]+)=(.+)$/);
        if (m) values[m[1].trim()] = m[2].trim();
      }
      return values;
    } catch {
      // launcher.ini unreadable
      return {};
    }
  }

  /**
   * Whether XIVLauncher will run the game in a Proton prefix (protonprefix)
   * instead of a Wine prefix (wineprefix). Mirrors the RB fork's own check
   * in CreateCompatToolsInstance(): the startup type is "Proton", or
   * "Custom" with a Proton binary path (a "proton" launcher script inside
   * the configured binary directory). When RB_WineStartupType is absent the
   * user runs standard XIVLauncher, which has no Proton mode; the
   * WineStartupType check is a defensive fallback for it.
   */
  private isXlcoreProtonConfig(iniValues: Record<string, string>): boolean {
    if (iniValues['RB_WineStartupType']) {
      if (iniValues['RB_WineStartupType'] === 'Proton') return true;
      if (
        iniValues['RB_WineStartupType'] === 'Custom' &&
        iniValues['RB_WineBinaryPath'] &&
        existsSync(join(iniValues['RB_WineBinaryPath'], 'proton'))
      ) {
        return true;
      }
      return false;
    }
    return iniValues['WineStartupType'] === 'Proton';
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
