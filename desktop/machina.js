const { ZanarkandFFXIV } = require('node-zanarkand-ffxiv');
const isDev = require('electron-is-dev');
const path = require('path');
const { app } = require('electron');
const log = require('electron-log');
const { exec } = require('child_process');

const zanarkandExePath = path.join(app.getAppPath(), '../../resources/ZanarkandWrapper/ZanarkandWrapperJSON.exe');

let Zanarkand;

function sendToRenderer(win, packet) {
  win && win.webContents && win.webContents.send('packet', packet);
}

function filterPacketSessionID(packet) {
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
  return packetsFromOthers.indexOf(packet.type) > -1
    || packet.sourceActorSessionID === packet.targetActorSessionID;
}

// Add machina to firewall stuffs
function addMachinaFirewallRule() {
  const machinaExePath = path.join(app.getAppPath(), '../../resources/MachinaWrapper/MachinaWrapper.exe');
  exec(`netsh advfirewall firewall add rule name="FFXIVTeamcraft - Machina" dir=in action=allow program="${machinaExePath}" enable=yes`);
}

module.exports.addMachinaFirewallRule = addMachinaFirewallRule;

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

module.exports.start = function(win, config, verbose, winpcap, pid) {
  const region = config.get('region', null);
  const options = isDev ?
    {
      region: region,
      dataPath: path.join(__dirname, './zanarkand/')
    } : {
      region: region,
      executablePath: zanarkandExePath,
      remoteDataPath: path.join(app.getAppPath(), '../../resources/remote-data'),
      definitionsDir: path.join(app.getAppPath(), '../../resources/app.asar.unpacked/node_modules/node-machina-ffxiv/models/default')
    };

  options.logger = message => {
    log.log(message);
  };

  console.log(options);

  Zanarkand = new ZanarkandFFXIV(options);
  Zanarkand.filter(acceptedPackets);
  Zanarkand.start();
  Zanarkand.setMaxListeners(0);
  Zanarkand.on('any', (packet) => {
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
  if (Zanarkand) {
    Zanarkand.stop();
  }
};
