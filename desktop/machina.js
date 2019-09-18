const MachinaFFXIV = require('node-machina-ffxiv');
const isDev = require('electron-is-dev');
const path = require('path');
const { app } = require('electron');
const log = require('electron-log');
const isElevated = require('is-elevated');

const Machina = new MachinaFFXIV(isDev ? { monitorType: 'WinPCap', noData: true } : {
  monitorType: 'WinPCap',
  noData: true,
  machinaExePath: path.join(app.getAppPath(), '../../resources/MachinaWrapper/MachinaWrapper.exe'),
  remoteDataPath: path.join(app.getAppPath(), '../../resources/remote-data'),
  definitionsDir: path.join(app.getAppPath(), '../../resources/app.asar.unpacked/node_modules/node-machina-ffxiv/models/default')
});

module.exports.start = function(win) {
  isElevated().then(elevated => {
    log.info('elevated', elevated);
    if (elevated) {
      Machina.start(() => {
        log.info('Packet capture started');
      });
    } else {
      throw new Error('Not enough permissions to run packet capture');
    }
  });

  Machina.on('itemInfo', (packet) => {
    /**
     * catalogId => Item id
     *
     * If normal inventory, containerId => position
     * If armory chest or saddlebag, containerId is % 1000 and slot is position.
     */
    win && win.webContents.send('packet', packet);
  });

  Machina.on('updateInventorySlot', (packet) => {
    /**
     *
     */
    win && win.webContents.send('packet', packet);
  });
};

module.exports.stop = function() {
  Machina.stop();
};
