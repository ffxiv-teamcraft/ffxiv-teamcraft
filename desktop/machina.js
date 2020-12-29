const MachinaFFXIV = require('node-machina-ffxiv');
const isDev = require('electron-is-dev');
const path = require('path');
const { app, ipcMain } = require('electron');
const log = require('electron-log');
const isElevated = require('is-elevated');
const { exec } = require('child_process');

const machinaExePath = path.join(app.getAppPath(), '../../resources/MachinaWrapper/MachinaWrapper.exe');

let Machina;

function sendToRenderer(win, packet) {
  win && win.webContents && win.webContents.send('packet', packet);
}

const acceptedPackets = [
  'actorCast',
  'itemInfo',
  'updateInventorySlot',
  'inventoryTransaction',
  'currencyCrystalInfo',
  'marketBoardItemListingCount',
  'marketBoardItemListing',
  'marketBoardItemListingHistory',
  'marketBoardSearchResult',
  'marketTaxRates',
  'playerSetup',
  'playerSpawn',
  'inventoryModifyHandler',
  'npcSpawn',
  'objectSpawn',
  'playerStats',
  'updateClassInfo',
  'actorControl',
  'initZone',
  'effectResult',
  'eventPlay',
  'eventStart',
  'eventFinish',
  'eventPlay4',
  'eventPlay32',
  'someDirectorUnk4',
  'actorControlSelf',
  'retainerInformation',
  'weatherChange',
  'updatePositionHandler',
  'updatePositionInstance',
  'prepareZoning'
];

const packetsFromOthers = [
  'playerSpawn',
  'actorControl',
  'updateClassInfo',
  'actorControlSelf',
  'effectResult',
  'eventPlay',
  'eventStart',
  'eventFinish',
  'eventPlay4',
  'someDirectorUnk4',
  'npcSpawn',
  'objectSpawn'
];

function filterPacketSessionID(packet) {
  return packetsFromOthers.indexOf(packet.type) > -1
    || packet.sourceActorSessionID === packet.targetActorSessionID;
}


function sendWhenReady(win, channel, data) {
  win.webContents.send(channel, data);
  ipcMain.once('app-ready', () => {
    setTimeout(() => {
      win.webContents.send(channel, data);
    }, 2000);
  });
}

function addMachinaFirewallRule() {
  const machinaExePath = path.join(app.getAppPath(), '../../resources/MachinaWrapper/MachinaWrapper.exe');
  exec(`netsh advfirewall firewall add rule name="FFXIVTeamcraft - Machina" dir=in action=allow program="${machinaExePath}" enable=yes`);
}

module.exports.addMachinaFirewallRule = addMachinaFirewallRule;
module.exports.sendWhenReady = sendWhenReady;

module.exports.start = async function(win, config, verbose, pid) {
  const region = config.get('region', null);
  const rawsock = config.get('rawsock', false);
  const elevated = await isElevated();

  if (rawsock) {
    if (!elevated) {
      sendWhenReady(win, 'rawsock-needs-admin', true);
      return;
    }
    exec(`netsh advfirewall firewall show rule status=enabled name="FFXIVTeamcraft - Machina" verbose`, (...output) => {
      if (output[1].indexOf(appVersion) === -1) {
        exec('netsh advfirewall firewall delete rule name="FFXIVTeamcraft - Machina"', () => {
          addMachinaFirewallRule();
        });
      }
    });
  }

  const options = isDev ?
    {
      monitorType: rawsock ? 'RawSocket' : 'WinPCap',
      parseAlgorithm: 'PacketSpecific',
      region: region
    } : {
      monitorType: rawsock ? 'RawSocket' : 'WinPCap',
      parseAlgorithm: 'PacketSpecific',
      region: region,
      noData: true,
      machinaExePath: machinaExePath,
      remoteDataPath: path.join(app.getAppPath(), '../../resources/remote-data'),
      definitionsDir: path.join(app.getAppPath(), '../../resources/app.asar.unpacked/node_modules/node-machina-ffxiv/models/default')
    };

  options.logger = message => {
    if (message.level === 'info' && verbose) {
      log.info(message.message);
    } else if (message.level !== 'info') {
      log[message.level || 'warn'](message.message);
    }
  };

  if (pid) {
    options.pid = pid;
  }

  Machina = new MachinaFFXIV(options);
  Machina.filter(acceptedPackets);
  Machina.start(() => {
    log.info('Packet capture started');
  });
  Machina.setMaxListeners(0);
  Machina.on('any', (packet) => {
    if (verbose) {
      log.log(JSON.stringify(packet));
    }
    if (!filterPacketSessionID(packet)) {
      return;
    }
    if (acceptedPackets.indexOf(packet.type) > -1 || acceptedPackets.indexOf(packet.superType) > -1) {
      sendToRenderer(win, packet);
    }
  });
};

module.exports.stop = function() {
  if (Machina) {
    Machina.stop();
  }
};
