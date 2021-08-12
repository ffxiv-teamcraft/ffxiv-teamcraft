import { spawn } from 'child_process';
import { app } from 'electron';
import { log } from 'electron-log';
import { PacketCapture } from '../pcap/packet-capture';
import { Store } from '../store';

export class SquirrelEventHandler {

  constructor(private pcap: PacketCapture, private store: Store) {
  }

  handleSquirrelEvent() {
    if (process.argv.length === 1) {
      return false;
    }
    const path = require('path');

    const appFolder = path.resolve(process.execPath, '..');
    const rootAtomFolder = path.resolve(appFolder, '..');
    const updateDotExe = path.resolve(path.join(rootAtomFolder, 'Update.exe'));
    const exeName = path.basename(process.execPath);

    const spawnProcess = (command: string, args: any[]) => {
      let spawnedProcess;
      log('Spawn update', args);

      try {
        spawnedProcess = spawn(command, args, { detached: true });
      } catch (error) {
        log('ERROR Spawning update.exe', error);
      }

      return spawnedProcess;
    };

    const spawnUpdate = function(args) {
      return spawnProcess(updateDotExe, args);
    };


    const squirrelEvent = process.argv[1];
    switch (squirrelEvent) {
      case '--squirrel-install':
      case '--squirrel-firstrun':
        if (!this.store.get('setup:noShortcut', false)) {
          spawnUpdate(['--createShortcut', exeName]);
        }
        if (this.store.get('rawsock', false)) {
          this.pcap.addMachinaFirewallRule();
        }
        break;
      case '--squirrel-updated':
        // Optionally do things such as:
        // - Add your .exe to the PATH
        // - Write to the registry for things like file associations and
        //   explorer context menus
        // Install desktop and start menu shortcuts
        if (this.store.get('rawsock', false)) {
          this.pcap.addMachinaFirewallRule();
        }
        if (!this.store.get('setup:noShortcut', false)) {
          spawnUpdate(['--createShortcut', exeName]);
        }
        setTimeout(app.quit, 200);
        return true;

      case '--squirrel-uninstall':
        // Undo anything you did in the --squirrel-install and
        // --squirrel-updated handlers

        // Remove desktop and start menu shortcuts
        spawnUpdate(['--removeShortcut', exeName]);

        setTimeout(app.quit, 200);
        return true;

      case '--squirrel-obsolete':
        // This is called on the outgoing version of your app before
        // we update to the new version - it's the opposite of
        // --squirrel-updated

        app.quit();
        return true;
    }
  }
}
