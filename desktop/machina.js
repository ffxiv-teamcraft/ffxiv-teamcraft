const MachinaFFXIV = require('node-machina-ffxiv');
const isDev = require('electron-is-dev');
const path = require('path');
const { app } = require('electron');
const log = require('electron-log');
const isElevated = require('is-elevated');
const { exec } = require('child_process');

const machinaExePath = path.join(app.getAppPath(), '../../resources/MachinaWrapper/MachinaWrapper.exe');

let Machina;

function sendToRenderer(win, packet) {
  win && win.webContents && win.webContents.send('packet', packet);
}

module.exports.start = function(win, config, verbose) {
  isElevated().then(elevated => {
    log.info('elevated', elevated);
    if (elevated) {
      if (!config.get('firewall')) {
        exec(`netsh advfirewall firewall add rule name="FFXIVTeamcraft" dir=in action=allow program="${machinaExePath}" enable=yes`);
        config.set('firewall', true);
      }

      const options = isDev ?
        {
          monitorType: 'WinPCap',
          parseAlgorithm: 'CPUHeavy'
        } : {
          parseAlgorithm: 'CPUHeavy',
          noData: true,
          monitorType: 'WinPCap',
          machinaExePath: machinaExePath,
          remoteDataPath: path.join(app.getAppPath(), '../../resources/remote-data'),
          definitionsDir: path.join(app.getAppPath(), '../../resources/app.asar.unpacked/node_modules/node-machina-ffxiv/models/default')
        };

      if (verbose) {
        options.logger = log.log;
      }

      Machina = new MachinaFFXIV(options);
      Machina.start(() => {
        log.info('Packet capture started');
      });
      Machina.on('any', (packet) => {
        if (verbose) {
          log.log(JSON.stringify(packet));
        }
        const acceptedPackets = [
          'itemInfo',
          'updateInventorySlot',
          'currencyCrystalInfo',
          'marketBoardItemListing',
          'marketBoardItemListingHistory',
          'playerSetup',
          'playerSpawn',
          'inventoryModifyHandler',
          'npcSpawn',
          'ping',
          'playerStats',
          'updateClassInfo',
          'actorControl'
        ];
        if (acceptedPackets.indexOf(packet.type) > -1 || acceptedPackets.indexOf(packet.superType) > -1) {
          sendToRenderer(win, packet);
        }
      });
    } else {
      throw new Error('Not enough permissions to run packet capture');
    }
  });


};

module.exports.stop = function() {
  if (Machina) {
    Machina.stop();
  }
};
