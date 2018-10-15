const csv = require('csv-parser');
const fs = require('fs');
const http = require('http');
const path = require('path');

const outputFolder = path.join(__dirname, '../../apps/client/src/app/core/data/sources/');
const memoryData = [];

const nodes = {};
const aetherytes = [];
const monsters = {};
const npcs = {};

fs.existsSync('output') || fs.mkdirSync('output');

http.get('http://xivapi.com/memoryData/download', (memoryResponse) => {
  memoryResponse.setEncoding('utf8');
  memoryResponse.pipe(csv())
    .on('data', function(memoryRow) {
      memoryData.push(memoryRow);
    })
    .on('end', () => {
      console.log('Extracted memory data');
      extractData();
    });
});

extractData = () => {
  http.get('http://xivapi.com/mapdata/download', (res) => {
    res.setEncoding('utf8');
    res.pipe(csv())
      .on('data', function(row) {
        console.log(row);
        if (row.ContentIndex === 'BNPC') {
          handleMonster(row, memoryData);
        } else {
          switch (row.Type) {
            case 'NPC':
              handleNpc(row);
              break;
            case 'Gathering':
              handleNode(row);
              break;
            case 'Aetheryte':
              handleAetheryte(row);
              break;
            default:
              break;
          }
        }

      })
      .on('end', function() {
        const nodesData = JSON.stringify(nodes);
        // Write data that needs to be joined with game data first
        fs.writeFileSync('output/nodes-position.json', nodesData);
        console.log('nodes written');
        const aetherytesData = JSON.stringify(aetherytes);
        fs.writeFileSync('output/aetherytes.json', aetherytesData);
        console.log('aetherytes written');
        const npcsData = JSON.stringify(npcs);
        fs.writeFileSync('output/npcs.json', npcsData);
        console.log('npcs written');
        const monstersData = JSON.stringify(monsters);
        fs.writeFileSync(path.join(outputFolder, 'monsters.json'), monstersData);
        console.log('monsters written');
      });
  });
};

handleNode = (row) => {
  nodes[+row.ENpcResidentID] = {
    zoneid: +row.PlaceNameID,
    x: Math.round(+row.PosX),
    y: Math.round(+row.PosY)
  };
};

handleAetheryte = (row) => {
  const isShard = row.Name.indexOf('Shard') > -1 || row.Name.indexOf('Urbaine') > -1;
  aetherytes.push({
    id: row.ENpcResidentID === '2147483647' ? 12 : +row.ENpcResidentID,
    zoneid: +row.PlaceNameID,
    map: +row.MapID,
    placenameid: +row.PlaceNameID,
    x: Math.round(+row.PosX),
    y: Math.round(+row.PosY),
    type: isShard ? 1 : 0
  });
};

handleMonster = (row, memoryData) => {
  const monsterMemoryRow = memoryData.find(mRow => mRow.Hash === row.Hash);
  monsters[row.BNpcNameID] = {
    zoneid: +row.PlaceNameID,
    x: Math.round(+row.PosX),
    y: Math.round(+row.PosY)
  };
  if (monsterMemoryRow !== undefined) {
    monsters[row.BNpcNameID].level = +monsterMemoryRow.Level;
  }
};

handleNpc = (row) => {
  npcs[+row.ENpcResidentID] = {
    zoneid: +row.PlaceNameID,
    x: Math.round(+row.PosX),
    y: Math.round(+row.PosY)
  };
};
