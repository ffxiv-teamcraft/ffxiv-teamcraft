const MachinaFFXIV = require('node-machina-ffxiv');
const isDev = require('electron-is-dev');
const path = require('path');
const { app } = require('electron');
const log = require('electron-log');
const isElevated = require('is-elevated');
const { exec } = require('child_process');

const machinaExePath = path.join(app.getAppPath(), '../../resources/MachinaWrapper/MachinaWrapper.exe');

const Machina = new MachinaFFXIV(isDev ? { monitorType: 'WinPCap' } : {
  monitorType: 'WinPCap',
  noData: true,
  machinaExePath: machinaExePath,
  remoteDataPath: path.join(app.getAppPath(), '../../resources/remote-data'),
  definitionsDir: path.join(app.getAppPath(), '../../resources/app.asar.unpacked/node_modules/node-machina-ffxiv/models/default')
});

function sendToRenderer(win, packet) {
  win && win.webContents && win.webContents.send('packet', packet);
}

module.exports.start = function(win, config) {
  isElevated().then(elevated => {
    log.info('elevated', elevated);
    if (elevated) {
      if (!config.get('firewall')) {
        exec(`netsh advfirewall firewall add rule name="FFXIVTeamcraft" dir=in action=allow program="${machinaExePath}" enable=yes`);
        config.set('firewall', true);
      }
      Machina.start(() => {
        log.info('Packet capture started');
      });
    } else {
      throw new Error('Not enough permissions to run packet capture');
    }
  });

  Machina.on('any', (packet) => {
    const acceptedPackets = [
      'itemInfo',
      'updateInventorySlot',
      'marketBoardItemListing',
      'marketBoardItemListingHistory',
      'playerSetup',
      'playerSpawn',
      'inventoryModifyHandler',
      'npcSpawn',
      'ping',
      'playerStats',
      'updateClassInfo'
    ];
    if (acceptedPackets.indexOf(packet.type) > -1) {
      sendToRenderer(win, packet);
    }
  });
};

module.exports.stop = function() {
  Machina.stop();
};
