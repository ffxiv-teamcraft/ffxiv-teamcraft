const MachinaFFXIV = require('node-machina-ffxiv');
const Machina = new MachinaFFXIV({ monitorType: 'WinPCap' });
const log = require('electron-log');
const isElevated = require('is-elevated');

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
