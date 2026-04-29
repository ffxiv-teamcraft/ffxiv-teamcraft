/**
 * Postinstall shim.
 *
 * On Linux, @ffxiv-teamcraft/dll-inject uses Windows SDK headers (SDKDDKVer.h)
 * that can't compile on Linux.  Before electron-builder install-app-deps walks
 * node_modules for native modules to rebuild, we:
 *   1. Delete binding.gyp so electron-rebuild skips this package entirely.
 *   2. Replace index.js with a no-op stub so the module can still be required
 *      at runtime without crashing (packet-capture.ts already guards against
 *      using pcap on Linux anyway).
 *
 * On Windows/macOS the real package is left untouched.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

if (process.platform === 'linux') {
  const dllInjectDir = path.join(__dirname, '../../node_modules/@ffxiv-teamcraft/dll-inject');

  const bindingGyp = path.join(dllInjectDir, 'binding.gyp');
  if (fs.existsSync(bindingGyp)) {
    fs.unlinkSync(bindingGyp);
    console.log('[postinstall] Removed dll-inject/binding.gyp (Windows-only native module, not needed on Linux)');
  }

  const indexJs = path.join(dllInjectDir, 'index.js');
  fs.writeFileSync(
    indexJs,
    '// Linux stub — DLL injection is Windows-only; packet-capture.ts skips pcap on Linux.\n' +
    'module.exports = { getPIDByName: () => -1, injectPID: () => -1 };\n'
  );
  console.log('[postinstall] Replaced dll-inject/index.js with Linux stub');
}

execSync('electron-builder install-app-deps', { stdio: 'inherit' });
