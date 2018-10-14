const csv = require('csv-parser');
const fs = require('fs');
const http = require('http');
const path = require('path');

const outputFolder = path.join(__dirname, '../../apps/client/src/app/core/data/sources/');

const nodes = {};
const aetherytes = [];
const monsters = {};
const npcs = {};


http.get('http://xivapi.com/mapdata/download', (res) => {
  res.setEncoding('utf8');
  res.pipe(csv())
    .on('data', function(row) {
      if (row.ContentIndex === 'BNPC') {
        handleMonster(row);
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
    });
});

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

handleMonster = (row) => {
};

handleNpc = (row) => {
  npcs[+row.ENpcResidentID] = {
    zoneid: +row.PlaceNameID,
    x: Math.round(+row.PosX),
    y: Math.round(+row.PosY)
  };
};

// fs.createReadStream('monsters.csv')
//     .pipe(csv())
//     .on('data', function (row) {
//         const position = JSON.parse(row.position);
//         monsters[row.id] = {
//             zoneid: +row.placename,
//             x: position.ingame.x,
//             y: position.ingame.y,
//             level: JSON.parse(row.data).level
//         };
//     })
//     .on('end', function () {
//         const res = JSON.stringify(monsters);
//         fs.writeFileSync('output/monsters.json', res);
//         console.log("monsters CSV parse success");
//     });
