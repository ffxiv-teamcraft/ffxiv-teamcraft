const csv = require('csv-parser');
const request = require('request');
const fs = require('fs');
const http = require('https');
const Rx = require('rxjs');
const { switchMap, map } = require('rxjs/operators');
const { getAllPages, getOnePage, persistToJsonAsset, persistToTypescript, get, getAllEntries } = require('./tools.js');

const nodes = {};
const aetherytes = [];
const monsters = {};
const npcs = {};

fs.existsSync('output') || fs.mkdirSync('output');


// MapData extraction

// commented for now as we're waiting for the memory and map data endpoints to return non-empty csv files.
// const memoryData$ = new Rx.Subject();
//
// const mapData$ = new Rx.Subject();
// http.get('https://xivapi.com/downloads/xivapi-map-data', (res) => mapData$.next(res));
//
// http.get('https://xivapi.com/downloads/xivapi-memory-data', (memoryResponse) => {
//   const memoryData = [];
//   console.log(memoryResponse);
//   memoryResponse.setEncoding('utf8');
//   memoryResponse.pipe(csv())
//     .on('data', function(memoryRow) {
//       console.log(memoryRow);
//       memoryData.push(memoryRow);
//     })
//     .on('end', () => {
//       console.log('Extracted memory data, size: ', memoryData.length);
//       memoryData$.next(memoryData);
//     });
// });
//
// Rx.combineLatest(memoryData$, mapData$)
//   .subscribe(([memoryData, res]) => {
//     res.setEncoding('utf8');
//     res.pipe(csv())
//       .on('data', function(row) {
//         if (row.ContentIndex === 'BNPC') {
//           handleMonster(row, memoryData);
//         } else {
//           switch (row.Type) {
//             case 'NPC':
//               handleNpc(row);
//               break;
//             case 'Gathering':
//               handleNode(row);
//               break;
//             case 'Aetheryte':
//               handleAetheryte(row);
//               break;
//             default:
//               break;
//           }
//         }
//
//       })
//       .on('end', function() {
//         // Write data that needs to be joined with game data first
//         persistToJson('node-positions', nodes);
//         console.log('nodes written');
//         persistToTypescript('aetherytes', 'aetherytes', aetherytes);
//         console.log('aetherytes written');
//         persistToJson('npcs', npcs);
//         console.log('npcs written');
//         persistToJson('monsters', monsters);
//         console.log('monsters written');
//       });
//   });

handleNode = (row) => {
  nodes[+row.ENpcResidentID] = {
    map: +row.MapID,
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
    map: +row.MapID,
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
    map: +row.MapID,
    zoneid: +row.PlaceNameID,
    x: Math.round(+row.PosX),
    y: Math.round(+row.PosY)
  };
};

// Map ids extraction

const mapIds = [];

getAllPages('https://xivapi.com/map?columns=ID,PlaceName.Name_en&key=63cc0045d7e847149c3f').subscribe(res => {
  res.Results.forEach(map => {
    mapIds.push({ id: +map.ID, name: map.PlaceName.Name_en });
  });
}, null, () => {
  persistToTypescript('map-ids', 'mapIds', mapIds);
});

// Crafting log extraction

const craftingLog = [
  [],
  [],
  [],
  [],
  [],
  [],
  [],
  []
];

const craftingLogPages = [
  [],
  [],
  [],
  [],
  [],
  [],
  [],
  []
];


function addToLogPage(entry, pageId) {
  let page = craftingLogPages[entry.CraftType.ID].find(page => page.id === pageId);
  if (page === undefined) {
    craftingLogPages[entry.CraftType.ID].push({
      id: pageId,
      masterbook: entry.SecretRecipeBookTargetID,
      startLevel: entry.RecipeLevelTable,
      recipes: []
    });
    page = craftingLogPages[entry.CraftType.ID].find(page => page.id === pageId);
  }
  page.recipes.push({
    recipeId: entry.ID,
    itemId: entry.ItemResultTargetID,
    rlvl: entry.RecipeLevelTable.ID,
    icon: entry.ItemResult.Icon,
    category: entry.ItemResult.ItemUICategoryTargetID
  });
}

getAllEntries('https://xivapi.com/RecipeNotebookList', '63cc0045d7e847149c3f', true).subscribe(completeFetch => {
  completeFetch.forEach(page => {
    // If it's an empty page, don't go further
    if (!page.Recipe0 || page.Recipe0.ID === -1) {
      return;
    }
    Object.keys(page)
      .filter(key => {
        return /^Recipe\d+$/.test(key) && page[key] && page[key].ID !== -1 && page[key].ID !== null;
      })
      .sort((a, b) => {
        return +a.match(/^Recipe(\d+)$/)[1] - +b.match(/^Recipe(\d+)$/)[1];
      })
      .forEach(key => {
        const entry = page[key];
        craftingLog[entry.CraftType.ID].push(entry.ID);
        addToLogPage(entry, page.ID);
      });
  });
  persistToTypescript('crafting-log', 'craftingLog', craftingLog);
  persistToTypescript('crafting-log-pages', 'craftingLogPages', craftingLogPages);
});
