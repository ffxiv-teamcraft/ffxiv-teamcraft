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
//         persistToJsonAsset('npcs', npcs);
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

getAllPages('https://xivapi.com/map?columns=ID,PlaceName.Name_en,TerritoryType.WeatherRate&key=63cc0045d7e847149c3f').subscribe(res => {
  res.Results.forEach(map => {
    mapIds.push({ id: +map.ID, name: map.PlaceName.Name_en, weatherRate: map.TerritoryType.WeatherRate });
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

const gatheringLog = [
  [],
  []
];


const gatheringLogPages = [
  [],
  []
];


function addToCraftingLogPage(entry, pageId) {
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

function addToGatheringLogPage(entry, pageId, gathererIndex) {
  let page = gatheringLogPages[gathererIndex].find(page => page.id === pageId);
  if (page === undefined) {
    gatheringLogPages[gathererIndex].push({
      id: pageId,
      startLevel: entry.GatheringItemLevel.GatheringItemLevel,
      items: []
    });
    page = gatheringLogPages[gathererIndex].find(page => page.id === pageId);
  }
  page.items.push({
    itemId: entry.Item,
    ilvl: entry.GatheringItemLevelTargetID,
    lvl: entry.GatheringItemLevel.GatheringItemLevel,
    //TODO icon
    stars: entry.GatheringItemLevel.Stars,
    hidden: entry.IsHidden
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
        addToCraftingLogPage(entry, page.ID);
      });
  });
  persistToTypescript('crafting-log', 'craftingLog', craftingLog);
  persistToTypescript('crafting-log-pages', 'craftingLogPages', craftingLogPages);
});

getAllEntries('https://xivapi.com/GatheringNotebookList', '63cc0045d7e847149c3f', true).subscribe(completeFetch => {
  completeFetch.forEach(page => {
    // If it's an empty page, don't go further
    if (!page.GatheringItem0 || page.GatheringItem0.ID === -1) {
      return;
    }
    Object.keys(page)
      .filter(key => {
        return /^GatheringItem\d+$/.test(key) && page[key] && page[key].ID !== -1 && page[key].ID !== null;
      })
      .sort((a, b) => {
        return +a.match(/^GatheringItem(\d+)$/)[1] - +b.match(/^GatheringItem(\d+)$/)[1];
      })
      .forEach(key => {
        const entry = page[key];
        // 0 = MIN, 1 = BTN
        let gathererIndex = -1;
        if (page.ID < 80) {
          gathererIndex = 0;
        } else if (page.ID < 200) {
          gathererIndex = 1;
        } else {
          if ([2000, 2001, 2004, 2005, 2008, 2009, 2010, 2012, 2016].indexOf(page.ID)) {
            gathererIndex = 0;
          } else {
            gathererIndex = 1;
          }
        }
        gatheringLog[gathererIndex].push(entry.Item);
        addToGatheringLogPage(entry, page.ID, gathererIndex);
      });
  });
  persistToTypescript('gathering-log', 'gatheringLog', gatheringLog);
  persistToTypescript('gathering-log-pages', 'gatheringLogPages', gatheringLogPages);
});

// Weather index extraction
const weatherIndexes = [];

const weatherIndexData = {};

const weatherColumns = [
  'ID',
  'Rate0',
  'Rate1',
  'Rate2',
  'Rate3',
  'Rate4',
  'Rate5',
  'Rate6',
  'Rate7',
  'Weather0TargetID',
  'Weather1TargetID',
  'Weather2TargetID',
  'Weather3TargetID',
  'Weather4TargetID',
  'Weather5TargetID',
  'Weather6TargetID',
  'Weather7TargetID'
];

getAllPages(`https://xivapi.com/weatherrate?columns=${weatherColumns.join(',')}&key=63cc0045d7e847149c3f`).subscribe(res => {
  weatherIndexes.push(...res.Results);
}, null, () => {
  weatherIndexes.forEach(weatherIndex => {
    weatherIndexData[weatherIndex.ID] = {
      [weatherIndex.Rate0]: weatherIndex.Weather0TargetID,
      [weatherIndex.Rate1]: weatherIndex.Weather1TargetID,
      [weatherIndex.Rate2]: weatherIndex.Weather2TargetID,
      [weatherIndex.Rate3]: weatherIndex.Weather3TargetID,
      [weatherIndex.Rate4]: weatherIndex.Weather4TargetID,
      [weatherIndex.Rate5]: weatherIndex.Weather5TargetID,
      [weatherIndex.Rate6]: weatherIndex.Weather6TargetID,
      [weatherIndex.Rate7]: weatherIndex.Weather7TargetID
    };
  });
  persistToTypescript('weather-index', 'weatherIndex', weatherIndexData);
});
