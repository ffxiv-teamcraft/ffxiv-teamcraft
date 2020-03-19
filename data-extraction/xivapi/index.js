const csv = require('csv-parser');
const path = require('path');
const fs = require('fs');
const http = require('https');
const { map, switchMap, first, buffer, debounceTime } = require('rxjs/operators');
const { Subject, combineLatest, merge } = require('rxjs');
const { aggregateAllPages, getAllPages, persistToJson, persistToJsonAsset, persistToTypescript, getAllEntries, get } = require('./tools.js');
const Multiprogress = require('multi-progress');
const multi = new Multiprogress(process.stdout);
const allMobs = require('../../apps/client/src/assets/data/mobs') || {};
const fileStreamObservable = require('./file-stream-observable');

const nodes = {};
const gatheringPointToBaseId = {};
const aetherytes = [
  {
    'id': 73,
    'zoneid': 2100,
    'map': 215,
    'placenameid': 2100,
    'x': 11,
    'y': 14,
    'type': 0,
    'nameid': 2123
  }
];
const monsters = {};
const npcs = {};
const aetheryteNameIds = {};

let todo = [];

const onlyIndex = process.argv.indexOf('--only');
if (onlyIndex > -1) {
  todo = [...process.argv.slice(onlyIndex + 1)];
}
let cache = [];

try {
  cache = require(path.join(__dirname, 'progress.json'));
} catch (e) {
  // File not found, not an issue
}

const everything = process.argv.indexOf('--everything') > -1;

function getCoords(coords, mapData) {
  const c = mapData.size_factor / 100;
  return {
    x: Math.floor(10 * (41.0 / c) * ((((coords.x + mapData.offset_x) * c) + 1024) / 2048.0) + 1) / 10,
    y: Math.floor(10 * (41.0 / c) * ((((coords.y + mapData.offset_y) * c) + 1024) / 2048.0) + 1) / 10
  };
}

function hasTodo(operation, specific = false) {
  let matches = todo.indexOf(operation) > -1;
  if (!specific && everything && cache.indexOf(operation) === -1) {
    matches = true;
  }
  return matches;
}

function done(operation) {
  if (process.argv.indexOf('--no-progress') > -1) {
    return;
  }
  cache.push(operation);
  fs.writeFileSync(path.join(__dirname, 'progress.json'), JSON.stringify(cache));
}

fs.existsSync('output') || fs.mkdirSync('output');

let emptyBnpcNames = 0;

// if (hasTodo('missingNodes')) {
//   const nodes = require(path.join(__dirname, '../../apps/client/src/assets/data/node-positions.json'));
//   const itemNames = require(path.join(__dirname, '../../apps/client/src/assets/data/items.json'));
//   let count = 0;
//   Object.values(nodes).forEach((node) => {
//     if (node.items.filter(i => i < 100000).length > 0 && node.x === undefined) {
//       console.log(` - [ ] Items: ${node.items.map(item => itemNames[item.toString()].en).join(', ')}`);
//       console.log(`| Level: ${node.level}`);
//       console.log(`| Limited: ${node.limited}`);
//       count++;
//     }
//   });
//   console.log(`
//
//   **Total**: ${count}`);
// }

if (hasTodo('mappy')) {
  // MapData extraction
  const memoryData$ = new Subject();
  const mapData$ = new Subject();
  const npcs$ = new Subject();
  const aetherytes$ = new Subject();
  const nodes$ = new Subject();
  http.get('https://xivapi.com/download?data=map_data', (res) => mapData$.next(res));

  const parsedMemoryData = [];

  fs.createReadStream(path.join(__dirname, 'input/memory_data.csv'), 'utf-8').pipe(csv())
    .on('data', function(memoryRow) {
      parsedMemoryData.push(memoryRow);
    })
    .on('end', () => {
      // console.log('Extracted memory data, size: ', parsedMemoryData.length);
      memoryData$.next(parsedMemoryData);
    });

  getAllPages('https://xivapi.com/ENpcResident?columns=ID,Name_*,DefaultTalk').subscribe(page => {
    page.Results.forEach(npc => {
      npcs[npc.ID] = {
        ...npcs[npc.ID],
        en: npc.Name_en,
        ja: npc.Name_ja,
        de: npc.Name_de,
        fr: npc.Name_fr,
        defaultTalks: (npc.DefaultTalk || []).map(talk => talk.ID)
      };
      if (npc.BalloonTargetID > 0) {
        npcs[npc.ID].balloon = npc.BalloonTargetID;
      }
    });
  }, null, () => {
    npcs$.next(npcs);
  });

  getAllPages('https://xivapi.com/Aetheryte?columns=ID,PlaceNameTargetID').subscribe(page => {
    page.Results.forEach(aetheryte => {
      aetheryteNameIds[aetheryte.ID] = aetheryte.PlaceNameTargetID;
    });
  }, null, () => {
    aetherytes$.next(aetheryteNameIds);
  });

  const gatheringItems$ = new Subject();
  const gatheringItems = {};

  getAllPages('https://xivapi.com/GatheringItem?columns=ID,GatheringItemLevel,IsHidden,Item').subscribe(page => {
    page.Results
      .filter(item => item.GatheringItemLevel)
      .forEach(item => {
        gatheringItems[item.ID] = {
          level: item.GatheringItemLevel.GatheringItemLevel,
          stars: item.GatheringItemLevel.Stars,
          itemId: item.Item,
          hidden: item.IsHidden
        };
      });
  }, null, () => {
    persistToJsonAsset('gathering-items', gatheringItems);
    gatheringItems$.next(gatheringItems);
  });
  gatheringItems$.pipe(
    switchMap(gatheringItems => {
      return getAllPages('https://xivapi.com/GatheringPointBase?columns=ID,GatheringTypeTargetID,Item0,Item1,Item2,Item3,Item4,Item5,Item6,Item7,IsLimited,GameContentLinks,GatheringLevel')
        .pipe(
          map((page) => [page, gatheringItems])
        );
    })
  ).subscribe(([page, items]) => {
    page.Results.forEach(node => {
      let linkedPoints = [];
      if (node.GameContentLinks.GatheringPoint) {
        linkedPoints = node.GameContentLinks.GatheringPoint.GatheringPointBase;
      }
      nodes[node.ID] = {
        ...nodes[node.ID],
        items: [0, 1, 2, 3, 4, 5, 6, 7]
          .filter(i => node[`Item${i}`] > 0)
          .map(i => node[`Item${i}`])
          .filter(gatheringItemId => {
            return items[gatheringItemId];
          })
          .map(gatheringItemId => {
            return items[gatheringItemId].itemId;
          }),
        limited: node.IsLimited,
        level: node.GatheringLevel,
        type: node.GatheringTypeTargetID
      };
      if (linkedPoints.length > 0) {
        linkedPoints.forEach(point => {
          gatheringPointToBaseId[point] = node.ID;
        });
        persistToJsonAsset('gathering-point-base-to-node-id', gatheringPointToBaseId);
      }
    });
    if (page.Pagination.Page === page.Pagination.PageTotal) {
      nodes$.next(nodes);
    }
  });

  combineLatest([memoryData$, mapData$, nodes$, npcs$, aetherytes$])
    .subscribe(([memoryData, mapData]) => {
      mapData.setEncoding('utf8');
      mapData.pipe(csv())
        .on('data', function(row) {
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
          // Write data that needs to be joined with game data first
          persistToJsonAsset('node-positions', nodes);
          // console.log('nodes written');
          persistToTypescript('aetherytes', 'aetherytes', aetherytes);
          // console.log('aetherytes written');
          persistToJsonAsset('monsters', monsters);
          // console.log('monsters written', emptyBnpcNames);
          persistToJsonAsset('npcs', npcs);
          console.log('npcs written');
          done('mappy');
        });
    });
}


handleNode = (row) => {
  const baseId = gatheringPointToBaseId[+row.ENpcResidentID];
  if (baseId && +row.MapID) {
    nodes[baseId] = {
      ...nodes[baseId],
      map: +row.MapID,
      zoneid: +row.PlaceNameID,
      x: Math.round(+row.PosX * 10) / 10,
      y: Math.round(+row.PosY * 10) / 10
    };
  }
};

handleAetheryte = (row) => {
  const isShard = row.Name.indexOf('Shard') > -1 || row.Name.indexOf('Urbaine') > -1;
  // Remove shards from maps where they don't belong.
  if ((+row.PlaceNameID === 2411 || +row.PlaceNameID === 2953 || +row.PlaceNameID === 2000) && isShard) {
    return;
  }
  // Eulmore plaza appears in lakeland, gotta remove that.
  if (+row.PlaceNameID === 2953 && row.ENpcResidentID === 134) {
    return;
  }

  // Ok'Zundu is handled by hand.
  if (+row.ENpcResidentID === 73) {
    return;
  }

  // Tailfeather needs a fix for its map id
  if (+row.ENpcResidentID === 76) {
    row.PlaceNameID = 2000;
    row.MapID = 212;
  }

  aetherytes.push({
    id: row.ENpcResidentID === '2147483647' ? 12 : +row.ENpcResidentID,
    zoneid: +row.PlaceNameID,
    map: +row.MapID,
    placenameid: +row.PlaceNameID,
    nameid: aetheryteNameIds[row.ENpcResidentID === '2147483647' ? 12 : +row.ENpcResidentID],
    x: Math.round(+row.PosX * 10) / 10,
    y: Math.round(+row.PosY * 10) / 10,
    type: isShard ? 1 : 0
  });
};

handleMonster = (row, memoryData) => {
  let bnpcNameID = +row.BNpcNameID;
  if (bnpcNameID === 0) {
    const nameFromData = Object.keys(allMobs)
      .find(key => {
        return allMobs[key].en.toLowerCase() === row.Name.toLowerCase()
          || allMobs[key].ja.toLowerCase() === row.Name.toLowerCase()
          || allMobs[key].de.toLowerCase() === row.Name.toLowerCase()
          || allMobs[key].fr.toLowerCase() === row.Name.toLowerCase();
      });
    if (nameFromData !== undefined) {
      bnpcNameID = +nameFromData;
    } else {
      emptyBnpcNames++;
      return;
    }
  }
  const monsterMemoryRow = memoryData.find(mRow => mRow.Hash === row.Hash);
  monsters[bnpcNameID] = monsters[row.BNpcNameID] || {
    baseid: +row.BNpcBaseID,
    positions: []
  };
  const newEntry = {
    map: +row.MapID,
    zoneid: +row.PlaceNameID,
    x: Math.round(+row.PosX * 10) / 10,
    y: Math.round(+row.PosY * 10) / 10
  };
  if (monsterMemoryRow !== undefined) {
    newEntry.level = +monsterMemoryRow.Level;
  }
  monsters[bnpcNameID].positions.push(newEntry);
};

handleNpc = (row) => {
  npcs[+row.ENpcResidentID] = {
    ...npcs[+row.ENpcResidentID],
    position:
      {
        map: +row.MapID,
        zoneid: +row.PlaceNameID,
        x: Math.round(+row.PosX * 10) / 10,
        y: Math.round(+row.PosY * 10) / 10
      }
  };
};

// Map ids extraction

if (hasTodo('map')) {
  const mapIds = [];

  getAllPages('https://xivapi.com/map?columns=ID,PlaceName.Name_en,PlaceName.ID,TerritoryType.WeatherRate,TerritoryTypeTargetID,SizeFactor').subscribe(res => {
    res.Results.forEach(map => {
      mapIds.push({
        id: +map.ID,
        zone: +map.PlaceName.ID,
        name: map.PlaceName.Name_en,
        territory: +map.TerritoryTypeTargetID,
        scale: +map.SizeFactor,
        weatherRate: map.TerritoryType.WeatherRate
      });
    });
  }, null, () => {
    persistToTypescript('map-ids', 'mapIds', mapIds);
    done('map');
  });
}

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


const gatheringLogPages = [
  [],
  [],
  [],
  []
];


function addToCraftingLogPage(entry, pageId) {
  craftingLogPages[entry.CraftTypeTargetID] = craftingLogPages[entry.CraftTypeTargetID] || [];
  let page = craftingLogPages[entry.CraftTypeTargetID].find(page => page.id === pageId);
  if (page === undefined) {
    craftingLogPages[entry.CraftTypeTargetID].push({
      id: pageId,
      masterbook: entry.SecretRecipeBook,
      startLevel: entry.RecipeLevelTable,
      recipes: []
    });
    page = craftingLogPages[entry.CraftTypeTargetID].find(page => page.id === pageId);
  }
  if (page.recipes.some(r => r.recipeId === entry.ID)) {
    return;
  }
  page.recipes.push({
    recipeId: entry.ID,
    itemId: entry.ItemResultTargetID,
    rlvl: entry.RecipeLevelTable.ID
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
    stars: entry.GatheringItemLevel.Stars,
    hidden: entry.IsHidden
  });
}


if (hasTodo('craftingLog')) {
  const recipeLevelTable = {};
  const RecipeLevelTable$ = new Subject();
  getAllPages('https://xivapi.com/RecipeLevelTable?columns=ClassJobLevel,Difficulty,ID,Quality,Stars,SuggestedControl,SuggestedCraftsmanship').subscribe(page => {
    page.Results.forEach(entry => {
      recipeLevelTable[entry.ID] = entry;
    });
  }, null, () => RecipeLevelTable$.next(recipeLevelTable));

  combineLatest([
    getAllEntries('https://xivapi.com/RecipeNotebookList', true),
    RecipeLevelTable$
  ]).subscribe(([completeFetch, rlvlTable]) => {
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
          try {
            craftingLog[entry.CraftTypeTargetID].push(entry.ID);
            addToCraftingLogPage(entry, page.ID);
          } catch (e) {
            console.log(e);
            console.log(entry);
          }
        });
    });
    persistToJsonAsset('crafting-log', craftingLog);
    persistToJsonAsset('crafting-log-pages', craftingLogPages);
    done('craftingLog');
  });
}

if (hasTodo('notebookDivision')) {
  const notebookDivision = {};
  getAllEntries('https://xivapi.com/NotebookDivision', true).subscribe(completeFetch => {
    completeFetch.forEach(row => {
      notebookDivision[row.ID] = {
        name: {
          en: row.Name_en,
          ja: row.Name_ja,
          de: row.Name_de,
          fr: row.Name_fr
        },
        pages: [0, 1, 2, 3, 4, 5, 6, 7].map(index => {
          if (row.ID < 1000) {
            return 40 * index + row.ID;
          }
          return 1000 + 8 * (row.ID - 1000) + index;
        })
      };
    });
    persistToJsonAsset('notebook-division', notebookDivision);
    done('notebookDivision');
  });
}

if (hasTodo('notebookDivisionCategory')) {
  const notebookDivisionCategory = {};
  getAllPages('https://xivapi.com/NotebookDivisionCategory?columns=ID,Name_*,GameContentLinks').subscribe(page => {
    page.Results.forEach(row => {
      notebookDivisionCategory[row.ID] = {
        name: {
          en: row.Name_en,
          ja: row.Name_ja,
          de: row.Name_de,
          fr: row.Name_fr
        },
        divisions: row.GameContentLinks.NotebookDivision.NotebookDivisionCategory
      };
    });
  }, null, () => {
    persistToJsonAsset('notebook-division-category', notebookDivisionCategory);
    done('notebookDivisionCategory');
  });
}

if (hasTodo('gatheringLog')) {

  getAllEntries('https://xivapi.com/GatheringNotebookList', true).subscribe(completeFetch => {
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
          let pageId = page.ID;
          const entry = page[key];
          // 0 = MIN, 1 = MIN (quarrying), 2 = BTN, 3 = BTN (grass thing)
          let gathererIndex = -1;
          if (page.ID < 40) {
            gathererIndex = 0;
          } else if (page.ID < 80) {
            gathererIndex = 1;
          } else if (page.ID < 120) {
            gathererIndex = 2;
          } else if (page.ID < 200) {
            gathererIndex = 3;
          } else {
            gathererIndex = (page.ID - 2000) % 4;
            pageId = 9999;
          }
          addToGatheringLogPage(entry, pageId, gathererIndex);
        });
    });
    persistToJsonAsset('gathering-log-pages', gatheringLogPages);
    done('gatheringLog');
  });

}

if (hasTodo('fishingLog')) {

  const diademTerritory = require('./input/diadem-territory.json');

  const diademFishingSpotCoords = {
    10001: {
      x: 12,
      y: 36
    },
    10002: {
      x: 11,
      y: 29
    },
    10003: {
      x: 10.5,
      y: 9.1
    },
    10004: {
      x: 32.4,
      y: 9.5
    },
    10005: {
      x: 29,
      y: 33
    },
    10006: {
      x: 12.2,
      y: 24.4
    },
    10007: {
      x: 26,
      y: 16
    }
  };

  const fishingLog = [];

  getAllEntries('https://xivapi.com/FishParameter').pipe(
    map(completeFetch => {
      const fishParameter = {};
      completeFetch
        .filter(fish => fish.Item !== null && fish.IsInLog === 1)
        .forEach(fish => {
          if (fish.TerritoryType === null) {
            throw new Error(`No territory for FishParameter#${fish.ID}`);
          }
          const entry = {
            id: fish.ID,
            itemId: fish.Item.ID,
            level: fish.GatheringItemLevel,
            icon: fish.Item.Icon,
            mapId: fish.TerritoryType.Map.ID,
            zoneId: fish.TerritoryType.PlaceName.ID,
            timed: fish.TimeRestricted,
            weathered: fish.WeatherRestricted
          };
          if (fish.FishingRecordType && fish.FishingRecordType.Addon) {
            entry.recordType = {
              en: fish.FishingRecordType.Addon.Text_en,
              de: fish.FishingRecordType.Addon.Text_de,
              ja: fish.FishingRecordType.Addon.Text_ja,
              fr: fish.FishingRecordType.Addon.Text_fr
            };
          }
          fishParameter[fish.Item.ID] = entry;
        });
      return fishParameter;
    })
  ).subscribe(fishParameter => {
    persistToJsonAsset('fish-parameter', fishParameter);
  });

  getAllEntries('https://xivapi.com/FishingSpot', true).subscribe((completeFetch) => {
    const spots = [];
    const fishes = [];
    completeFetch
      .filter(spot => spot.Item0 !== null && spot.PlaceName !== null && (spot.TerritoryType !== null || spot.ID >= 10000))
      .forEach(spot => {
        // Let's check if this is diadem
        if (spot.TerritoryType === null && spot.ID >= 10000) {
          spot.TerritoryType = diademTerritory;
        }
        const c = spot.TerritoryType.Map.SizeFactor / 100.0;
        spots.push({
          id: spot.ID,
          mapId: spot.TerritoryType.Map.ID,
          placeId: spot.TerritoryType.PlaceName.ID,
          zoneId: spot.PlaceName.ID,
          coords: spot.ID >= 10000 ? diademFishingSpotCoords[spot.ID] : {
            x: (41.0 / c) * (((spot.X * c)) / 2048.0) + 1,
            y: (41.0 / c) * (((spot.Z * c)) / 2048.0) + 1
          },
          fishes: Object.keys(spot)
            .filter(key => /Item\dTargetID/.test(key))
            .map(key => +spot[key])
        });
        Object.keys(spot)
          .filter(key => {
            return /^Item\d+$/.test(key) && spot[key] && spot[key].ID !== -1 && spot[key].ID !== null;
          })
          .sort((a, b) => {
            return +a.match(/^Item(\d+)$/)[1] - +b.match(/^Item(\d+)$/)[1];
          })
          .forEach(key => {
            const fish = spot[key];
            if (fishes.indexOf(fish.ID) === -1) {
              fishes.push(fish.ID);
            }
            const c = spot.TerritoryType.Map.SizeFactor / 100.0;
            const entry = {
              itemId: fish.ID,
              level: spot.GatheringLevel,
              icon: fish.Icon,
              mapId: spot.TerritoryType.Map.ID,
              placeId: spot.TerritoryType.PlaceName.ID,
              zoneId: spot.PlaceName.ID,
              spot: {
                id: spot.ID,
                coords: {
                  x: (41.0 / c) * ((spot.X * c) / 2048.0) + 1,
                  y: (41.0 / c) * ((spot.Z * c) / 2048.0) + 1
                }
              }
            };
            fishingLog.push(entry);
          });
      });
    persistToJsonAsset('fishing-log', fishingLog);
    persistToJsonAsset('fishing-spots', spots);
    persistToJsonAsset('fishes', fishes);
    done('fishingLog');
  });

}

if (hasTodo('spearFishingLog')) {

  const sheetEntries = [];

  fs.createReadStream(path.join(__dirname, 'csv/FFXIV Data - Fishing.csv'))
    .pipe(csv())
    .on('data', (data) => sheetEntries.push(data))
    .on('end', () => {

      const spearFishingLog = [];

      getAllEntries('https://xivapi.com/SpearfishingNotebook', true).subscribe(completeFetch => {
        completeFetch
          .filter(entry => entry.GatheringPointBase)
          .forEach(entry => {
            const entries = Object.keys(entry.GatheringPointBase)
              .filter(key => /Item\d/.test(key))
              .filter(key => entry.GatheringPointBase[key] !== 0)
              .map(key => {
                const c = entry.TerritoryType.Map.SizeFactor / 100.0;
                return {
                  id: entry.ID,
                  itemId: entry.GatheringPointBase[key],
                  level: entry.GatheringLevel,
                  mapId: entry.TerritoryType.Map.ID,
                  placeId: entry.TerritoryType.PlaceName.ID,
                  zoneId: entry.PlaceName.ID,
                  coords: {
                    x: (41.0 / c) * ((entry.X * c) / 2048.0) + 1,
                    y: (41.0 / c) * ((entry.Y * c) / 2048.0) + 1
                  }
                };
              });
            spearFishingLog.push(...entries);
          });
        persistToTypescript('spear-fishing-log', 'spearFishingLog', spearFishingLog);
      });

      const spearFishingNodes = [];

      getAllEntries('https://xivapi.com/SpearfishingItem', true).subscribe(completeFetch => {
        completeFetch
          .filter(fish => fish.Item !== null)
          .forEach(fish => {
            const sheetEntry = sheetEntries.find(entry => {
              return entry.Fish === fish.Item.Name_en;
            });
            const entry = {
              id: fish.ID,
              itemId: fish.ItemTargetID,
              level: fish.GatheringItemLevel.ID,
              icon: fish.Item.Icon,
              mapId: fish.TerritoryType.Map.ID,
              zoneId: fish.TerritoryType.PlaceName.ID
            };
            if (sheetEntry !== undefined) {
              entry.gig = sheetEntry.Bait.split(' ')[0];
              if (sheetEntry.Start) {
                entry.spawn = +sheetEntry.Start;
                entry.duration = +sheetEntry.End > +sheetEntry.Start ? +sheetEntry.End - +sheetEntry.Start : +sheetEntry.Start - +sheetEntry.End;
              }
              if (sheetEntry['Predator, Amount']) {
                const split = sheetEntry['Predator, Amount'].split(', ');
                const predatorSheetEntry = sheetEntries.find(entry => {
                  return entry.Fish === split[0];
                });
                entry.predator = [{
                  name: split[0],
                  predatorAmount: +split[1]
                }];
                if (predatorSheetEntry && predatorSheetEntry.Start) {
                  entry.spawn = +predatorSheetEntry.Start;
                  entry.duration = +predatorSheetEntry.End > +predatorSheetEntry.Start ? +predatorSheetEntry.End - +predatorSheetEntry.Start : +predatorSheetEntry.Start - +predatorSheetEntry.End;
                }
              }
            }
            spearFishingNodes.push(entry);
          });
        persistToTypescript('spear-fishing-nodes', 'spearFishingNodes', spearFishingNodes);
        done('spearFishingLog');
      });
    });
}


if (hasTodo('weather-rate')) {
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

  getAllPages(`https://xivapi.com/weatherrate?columns=${weatherColumns.join(',')}`).subscribe(res => {
    weatherIndexes.push(...res.Results);
  }, null, () => {
    weatherIndexes.forEach(weatherIndex => {
      const entry = [];
      let previousRate = 0;
      for (let i = 0; i <= 7; i++) {
        const rate = weatherIndex[`Rate${i}`];
        const rateValue = rate + previousRate;
        previousRate = rateValue;
        if (rate > 0) {
          entry.push({ rate: rateValue, weatherId: weatherIndex[`Weather${i}TargetID`] });
        }
      }
      weatherIndexData[weatherIndex.ID] = entry;
    });
    persistToTypescript('weather-index', 'weatherIndex', weatherIndexData);
    done('weather-rate');
  });
}


if (hasTodo('weathers')) {
  const weathers = {};
  getAllPages('https://xivapi.com/Weather?columns=ID,Name_*').subscribe(page => {
    page.Results.forEach(weather => {
      weathers[weather.ID] = {
        name: {
          en: weather.Name_en,
          ja: weather.Name_ja,
          de: weather.Name_de,
          fr: weather.Name_fr
        }
      };
    });
  }, null, () => {
    persistToJsonAsset('weathers', weathers);
    done('weathers');
  });
}

if (hasTodo('aetherstream')) {
  const aetherstream = {};
  getAllPages('https://xivapi.com/Aetheryte?columns=ID,AetherstreamX,AetherstreamY').subscribe(page => {
    page.Results.forEach(row => {
      aetherstream[row.ID] = { x: row.AetherstreamX, y: row.AetherstreamY };
    });
  }, null, () => {
    persistToTypescript('aetherstream', 'aetherstream', aetherstream);
    done('aetherstream');
  });
}

if (hasTodo('maps')) {
  const maps = {};
  getAllPages('https://xivapi.com/Map?columns=ID,Hierarchy,MapFilename,OffsetX,OffsetY,MapMarkerRange,PlaceNameTargetID,PlaceNameRegionTargetID,PlaceNameSubTargetID,SizeFactor,TerritoryTypeTargetID').subscribe(page => {
    page.Results.forEach(mapData => {
      maps[mapData.ID] = {
        id: mapData.ID,
        hierarchy: mapData.Hierarchy,
        image: `https://xivapi.com${mapData.MapFilename}`,
        offset_x: mapData.OffsetX,
        offset_y: mapData.OffsetY,
        map_marker_range: mapData.MapMarkerRange,
        placename_id: mapData.PlaceNameTargetID,
        region_id: mapData.PlaceNameRegionTargetID,
        zone_id: mapData.PlaceNameSubTargetID,
        size_factor: mapData.SizeFactor,
        territory_id: mapData.TerritoryTypeTargetID
      };
    });
  }, null, () => {
    persistToJsonAsset('maps', maps);
    done('maps');
  });
}

if (hasTodo('tripleTriadRules')) {
  const rules = {};
  getAllPages('https://xivapi.com/TripleTriadRule?columns=ID,Name_*').subscribe(page => {
    page.Results.forEach(rule => {
      rules[rule.ID] = {
        name: {
          en: rule.Name_en,
          ja: rule.Name_ja,
          de: rule.Name_de,
          fr: rule.Name_fr
        }
      };
    });
  }, null, () => {
    persistToTypescript('triple-triad-rules', 'tripleTriadRules', rules);
    done('tripleTriadRules');
  });
}

if (hasTodo('quests')) {
  const quests = {};
  const nextQuest = {};
  const questChainLengths = {};
  getAllPages('https://xivapi.com/Quest?columns=ID,Name_*,Icon,PreviousQuest0TargetID,PreviousQuest1TargetID,PreviousQuest2TargetID,IconID').subscribe(page => {
    page.Results.forEach(quest => {
      quests[quest.ID] = {
        name: {
          en: quest.Name_en,
          ja: quest.Name_ja,
          de: quest.Name_de,
          fr: quest.Name_fr
        },
        icon: quest.Icon
      };
      for (let i = 0; i < 2; i++) {
        if (quest[`PreviousQuest${i}TargetID`] && quest.IconID !== 71201) {
          nextQuest[quest[`PreviousQuest${i}TargetID`]] = [...(nextQuest[quest[`PreviousQuest${i}TargetID`]] || []), quest.ID];
        }
      }
    });
  }, null, () => {
    Object.keys(quests)
      .map(key => +key)
      .forEach(questId => {
        let workingIds = [questId];
        let depth = 0;
        while ([].concat.apply([], workingIds.map(id => nextQuest[id] || [])).length > 0 && depth < 99) {
          workingIds = [].concat.apply([], workingIds.map(id => nextQuest[id]));
          depth++;
        }
        questChainLengths[questId] = depth;
      });
    persistToJsonAsset('quests', quests);
    persistToTypescript('quests-chain-lengths', 'questChainLengths', questChainLengths);
    done('quests');
  });
}

if (hasTodo('fates')) {
  const fates = {};
  getAllPages('https://xivapi.com/Fate?columns=ID,Name_*,Description_*,IconMap,ClassJobLevel,Location').subscribe(page => {
    page.Results.forEach(fate => {
      fates[fate.ID] = {
        name: {
          en: fate.Name_en,
          ja: fate.Name_ja,
          de: fate.Name_de,
          fr: fate.Name_fr
        },
        description: {
          en: fate.Description_en,
          ja: fate.Description_ja,
          de: fate.Description_de,
          fr: fate.Description_fr
        },
        icon: fate.IconMap,
        level: fate.ClassJobLevel,
        location: fate.Location
      };
    });
  }, null, () => {
    persistToJsonAsset('fates', fates);
  });
}

if (hasTodo('levelLGB', true)) {
  console.log('STARTING LevelLGB extraction');
  const mapData = require('../../apps/client/src/assets/data/maps.json');
  const fates = require('../../apps/client/src/assets/data/fates.json');

  const levelLGB$ = fileStreamObservable(path.join(__dirname, 'input/LevelLGB.csv'));

  levelLGB$.pipe(
    buffer(levelLGB$.pipe(debounceTime(500)))
  ).subscribe(csvData => {
    Object.keys(fates).forEach(key => {
      const location = csvData.find(row => +row.LocationID === fates[key].location);
      if (!location) {
        return;
      }
      fates[key].position = {
        zoneid: +mapData[location.Map].placename_id,
        ...getCoords({
          x: location.X,
          y: location.Z
        }, mapData[location.Map])
      };
    });
    persistToJsonAsset('fates', fates);
    process.exit(0);
  });
}

if (hasTodo('instances')) {
  const instances = {};
  getAllPages('https://xivapi.com/InstanceContent?columns=ID,ContentFinderCondition.Name_*,Icon,InstanceContentTextDataBossEndTargetID,InstanceContentTextDataBossStartTargetID,InstanceContentTextDataObjectiveEndTargetID,InstanceContentTextDataObjectiveStartTargetID').subscribe(page => {
    page.Results.forEach(instance => {
      instances[instance.ID] = {
        en: instance.ContentFinderCondition.Name_en,
        ja: instance.ContentFinderCondition.Name_ja,
        de: instance.ContentFinderCondition.Name_de,
        fr: instance.ContentFinderCondition.Name_fr,
        icon: instance.Icon
      };
      const contentText = [
        instance.InstanceContentTextDataBossEndTargetID,
        instance.InstanceContentTextDataBossStartTargetID,
        instance.InstanceContentTextDataObjectiveEndTargetID,
        instance.InstanceContentTextDataObjectiveStartTargetID
      ].filter(id => id > 0);
      if (contentText.length > 0) {
        instances[instance.ID].contentText = contentText;
      }
    });
  }, null, () => {
    persistToJsonAsset('instances', instances);
    done('instances');
  });
}

if (hasTodo('shops')) {
  const shops = {};
  getAllPages('https://xivapi.com/SpecialShop?columns=ID,Name_*').subscribe(page => {
    page.Results.forEach(shop => {
      shops[shop.ID] = {
        en: shop.Name_en,
        ja: shop.Name_ja,
        de: shop.Name_de,
        fr: shop.Name_fr
      };
    });
  }, null, () => {
    persistToJsonAsset('shops', shops);
    done('shops');
  });
}

if (hasTodo('leves')) {
  const leves = {};
  getAllPages('https://xivapi.com/Leve?columns=ID,Name_*,ClassJobCategory.Name_*,ClassJobLevel').subscribe(page => {
    page.Results.forEach(leve => {
      leves[leve.ID] = {
        en: leve.Name_en,
        ja: leve.Name_ja,
        de: leve.Name_de,
        fr: leve.Name_fr,
        job: {
          en: leve.ClassJobCategory.Name_en,
          ja: leve.ClassJobCategory.Name_ja,
          de: leve.ClassJobCategory.Name_de,
          fr: leve.ClassJobCategory.Name_fr
        },
        lvl: leve.ClassJobLevel
      };
    });
  }, null, () => {
    persistToJsonAsset('leves', leves);
    done('leves');
  });
}

if (hasTodo('jobCategories')) {
  const jobCategories = {};
  getAllPages('https://xivapi.com/ClassJobCategory?columns=ID,Name_*').subscribe(page => {
    page.Results.forEach(category => {
      jobCategories[category.ID] = {
        en: category.Name_en,
        ja: category.Name_ja,
        de: category.Name_de,
        fr: category.Name_fr
      };
    });
  }, null, () => {
    persistToTypescript('job-categories', 'jobCategories', jobCategories);
    done('jobCategories');
  });
}

if (hasTodo('mobs')) {
  const mobs = {};
  getAllPages('https://xivapi.com/BNpcName?columns=ID,Name_*').subscribe(page => {
    page.Results.forEach(mob => {
      mobs[mob.ID] = {
        en: mob.Name_en,
        ja: mob.Name_ja,
        de: mob.Name_de,
        fr: mob.Name_fr
      };
    });
  }, null, () => {
    persistToJsonAsset('mobs', mobs);
    done('mobs');
  });
}

if (hasTodo('places')) {
  const places = {};
  getAllPages('https://xivapi.com/PlaceName?columns=ID,Name_*').subscribe(page => {
    page.Results.forEach(place => {
      places[place.ID] = {
        en: place.Name_en,
        ja: place.Name_ja,
        de: place.Name_de,
        fr: place.Name_fr
      };
    });
  }, null, () => {
    persistToJsonAsset('places', places);
    done('places');
  });
}

if (hasTodo('hunts')) {
  const huntZones = [
    134,
    135,
    137,
    138,
    139,
    140,
    141,
    145,
    146,
    147,
    148,
    152,
    153,
    154,
    155,
    156,
    180,
    397,
    398,
    399,
    400,
    401,
    402,
    612,
    620,
    621,
    613,
    614,
    622
  ];
  combineLatest(
    huntZones.map(zone => {
      return get(`https://xivhunt.net/api/worlds/SpawnPoints/${zone}`)
        .pipe(
          map(hunt => {
            return {
              zoneid: zone,
              hunts: hunt
            };
          })
        );
    }))
    .pipe(
      first()
    )
    .subscribe(hunts => {
      persistToJsonAsset('hunts', hunts);
      done('hunts');
    });
}

if (hasTodo('gatheringBonuses')) {
  const bonuses = {};
  getAllPages('https://xivapi.com/GatheringPointBonus?columns=ID,BonusType,Condition,BonusValue,ConditionValue').subscribe(page => {
    page.Results.forEach(bonus => {
      bonuses[bonus.ID] = {
        value: bonus.BonusValue,
        conditionValue: bonus.ConditionValue
      };
      if (bonus.BonusType) {
        bonuses[bonus.ID].bonus = {
          en: bonus.BonusType.Text_en,
          de: bonus.BonusType.Text_de,
          ja: bonus.BonusType.Text_ja,
          fr: bonus.BonusType.Text_fr
        };
      }
      if (bonus.Condition) {
        bonuses[bonus.ID].condition = {
          en: bonus.Condition.Text_en,
          de: bonus.Condition.Text_de,
          ja: bonus.Condition.Text_ja,
          fr: bonus.Condition.Text_fr
        };
      }
    });
  }, null, () => {
    persistToJsonAsset('gathering-bonuses', bonuses);
    done('gatheringBonuses');
  });
}

if (hasTodo('cdGroups')) {
  const groups = {};
  getAllPages('https://xivapi.com/Action?columns=ID,CooldownGroup').subscribe(page => {
    page.Results.forEach(action => {
      groups[action.CooldownGroup] = [
        ...(groups[action.CooldownGroup] || []),
        action.ID
      ];
    });
  }, null, () => {
    persistToJsonAsset('action-cd-groups', groups);
    done('cdGroups');
  });
}

if (hasTodo('combos')) {
  const combos = {};
  getAllPages('https://xivapi.com/Action?columns=ID,ActionComboTargetID').subscribe(page => {
    page.Results.forEach(action => {
      if (action.ActionComboTargetID > 0) {
        combos[action.ID] = action.ActionComboTargetID;
      }
    });
  }, null, () => {
    persistToTypescript('action-combos', 'actionCombos', combos);
    done('combos');
  });
}

if (hasTodo('statuses')) {
  const statuses = {};
  getAllPages('https://xivapi.com/Status?columns=ID,Name_*,Icon').subscribe(page => {
    page.Results.forEach(status => {
      statuses[status.ID] = {
        en: status.Name_en,
        de: status.Name_de,
        ja: status.Name_ja,
        fr: status.Name_fr,
        icon: status.Icon
      };
    });
  }, null, () => {
    persistToJsonAsset('statuses', statuses);
    done('statuses');
  });
}

if (hasTodo('traits')) {
  const traits = {};
  getAllPages('https://xivapi.com/Trait?columns=ID,Name_*,Description_*,Icon').subscribe(page => {
    page.Results.forEach(trait => {
      traits[trait.ID] = {
        en: trait.Name_en,
        de: trait.Name_de,
        ja: trait.Name_ja,
        fr: trait.Name_fr,
        icon: trait.Icon,
        description: {
          en: trait.Description_en,
          de: trait.Description_de,
          ja: trait.Description_ja,
          fr: trait.Description_fr
        }
      };
    });
  }, null, () => {
    persistToJsonAsset('traits', traits);
    done('traits');
  });
}

if (hasTodo('items')) {
  const getSlotName = (equipSlotCategoryId) => {
    return [
      '1HWpn%',
      'OH%',
      'Head%',
      'Chest%',
      'Hands%',
      'Waist%',
      'Legs%',
      'Feet%',
      'Earring%',
      'Necklace%',
      'Bracelet%',
      'Ring%',
      '2HWpn%',
      '1HWpn%',
      'ChestHead%',
      'ChestHeadLegsFeet%',
      '',
      'LegsFeet%',
      'HeadChestHandsLegsFeet%',
      'ChestLegsGloves%',
      'ChestLegsFeet%',
      ''
    ][equipSlotCategoryId - 1];
  };
  const names = {};
  const rarities = {};
  const itemIcons = {};
  const ilvls = {};
  const stackSizes = {};
  const itemSlots = {};
  const itemStats = {};
  const itemMeldingData = {};
  const equipSlotCategoryId = {};
  const itemPatch = {};
  getAllPages('https://xivapi.com/Item?columns=Patch,ID,Name_*,CanBeHq,Rarity,GameContentLinks,Icon,LevelItem,StackSize,EquipSlotCategoryTargetID,Stats,MateriaSlotCount,BaseParamModifier,IsAdvancedMeldingPermitted')
    .subscribe(page => {
      page.Results.forEach(item => {
        itemIcons[item.ID] = item.Icon;
        names[item.ID] = {
          en: item.Name_en,
          de: item.Name_de,
          ja: item.Name_ja,
          fr: item.Name_fr
        };
        rarities[item.ID] = item.Rarity;
        ilvls[item.ID] = item.LevelItem;
        stackSizes[item.ID] = item.StackSize;
        itemSlots[item.ID] = item.EquipSlotCategoryTargetID;
        itemPatch[item.ID] = item.Patch;
        if (item.Stats) {
          itemStats[item.ID] = Object.values(item.Stats);
        }
        if (item.EquipSlotCategoryTargetID) {
          equipSlotCategoryId[item.ID] = item.EquipSlotCategoryTargetID;
          itemMeldingData[item.ID] = {
            modifier: item.BaseParamModifier,
            prop: getSlotName(item.EquipSlotCategoryTargetID),
            slots: item.MateriaSlotCount,
            overmeld: item.IsAdvancedMeldingPermitted === 1,
            canBeHq: item.CanBeHq === 1
          };
        }
      });
    }, null, () => {
      persistToJsonAsset('item-icons', itemIcons);
      persistToJsonAsset('items', names);
      persistToJsonAsset('rarities', rarities);
      persistToJsonAsset('ilvls', ilvls);
      persistToJsonAsset('stack-sizes', stackSizes);
      persistToJsonAsset('item-slots', itemSlots);
      persistToJsonAsset('item-stats', itemStats);
      persistToJsonAsset('item-melding-data', itemMeldingData);
      persistToJsonAsset('item-equip-slot-category', equipSlotCategoryId);
      persistToJsonAsset('item-patch', itemPatch);
      done('items');
    });
}

if (hasTodo('aetherytes')) {
  const names = {};
  getAllPages('https://xivapi.com/Aetheryte?columns=ID,AethernetName.Name_*').subscribe(page => {
    page.Results.forEach(aetheryte => {
      if (aetheryte.AethernetName.Name_en === null) {
        return;
      }
      names[aetheryte.ID] = {
        en: aetheryte.AethernetName.Name_en,
        de: aetheryte.AethernetName.Name_de,
        ja: aetheryte.AethernetName.Name_ja,
        fr: aetheryte.AethernetName.Name_fr
      };
    });
  }, null, () => {
    persistToTypescript('aetheryte-names', 'aetheryteNames', names);
    done('aetherytes');
  });
}

if (hasTodo('achievements')) {
  const achievements = {};
  const icons = {};
  getAllPages('https://xivapi.com/Achievement?columns=ID,Name_*,Icon').subscribe(page => {
    page.Results.forEach(achievement => {
      achievements[achievement.ID] = {
        en: achievement.Name_en,
        de: achievement.Name_de,
        ja: achievement.Name_ja,
        fr: achievement.Name_fr
      };
      icons[achievement.ID] = achievement.Icon;
    });
  }, null, () => {
    persistToJsonAsset('achievements', achievements);
    persistToJsonAsset('achievement-icons', icons);
    done('achievements');
  });
}

if (hasTodo('recipes')) {
  // We're maintaining two formats, that's bad but migrating all the usages of the current recipe model isn't possible, sadly.
  const recipes = [];
  getAllPages('https://xivapi.com/Recipe?columns=ID,ClassJob.ID,MaterialQualityFactor,DurabilityFactor,QualityFactor,DifficultyFactor,RequiredControl,RequiredCraftsmanship,CanQuickSynth,RecipeLevelTable,AmountResult,ItemResultTargetID,ItemIngredient0,ItemIngredient1,ItemIngredient2,ItemIngredient3,ItemIngredient4,ItemIngredient5,ItemIngredient6,ItemIngredient7,ItemIngredient8,ItemIngredient9,AmountIngredient0,AmountIngredient1,AmountIngredient2,AmountIngredient3,AmountIngredient4,AmountIngredient5,AmountIngredient6,AmountIngredient7,AmountIngredient8,AmountIngredient9,IsExpert').subscribe(page => {
    page.Results.forEach(recipe => {
      if (recipe.RecipeLevelTable === null) {
        return;
      }
      const maxQuality = Math.floor(recipe.RecipeLevelTable.Quality * recipe.QualityFactor / 100);
      const ingredients = Object.keys(recipe)
        .filter(k => /ItemIngredient\d/.test(k))
        .sort((a, b) => a < b ? -1 : 1)
        .filter(key => recipe[key] && recipe[key].ID > 19)
        .map((key, index) => {
          return {
            id: recipe[key].ID,
            amount: +recipe[`AmountIngredient${index}`],
            ilvl: +recipe[key].LevelItem
          };
        });
      const totalContrib = maxQuality * recipe.MaterialQualityFactor / 100;
      const totalIlvl = ingredients.reduce((acc, cur) => acc + cur.ilvl * cur.amount, 0);
      recipes.push({
        id: recipe.ID,
        job: recipe.ClassJob.ID,
        lvl: recipe.RecipeLevelTable.ClassJobLevel,
        yields: recipe.AmountResult,
        result: recipe.ItemResultTargetID,
        stars: recipe.RecipeLevelTable.Stars,
        qs: recipe.CanQuickSynth === 1,
        hq: recipe.CanHq === 1,
        durability: Math.floor(recipe.RecipeLevelTable.Durability * recipe.DurabilityFactor / 100),
        quality: maxQuality,
        progress: Math.floor(recipe.RecipeLevelTable.Difficulty * recipe.DifficultyFactor / 100),
        suggestedControl: recipe.RecipeLevelTable.SuggestedControl,
        suggestedCraftsmanship: recipe.RecipeLevelTable.SuggestedCraftsmanship,
        controlReq: recipe.RequiredControl,
        craftsmanshipReq: recipe.RequiredCraftsmanship,
        rlvl: recipe.RecipeLevelTable.ID,
        ingredients: ingredients
          .map(ingredient => {
            return {
              id: ingredient.id,
              amount: ingredient.amount,
              quality: (ingredient.ilvl / totalIlvl) * totalContrib
            };
          }),
        expert: recipe.IsExpert === 1
      });
    });
  }, null, () => {
    persistToJsonAsset('recipes', recipes);
    done('recipes');
  });
}

if (hasTodo('actions')) {
  const icons = {};
  const actions = {};
  const craftActions = {};
  merge(
    getAllPages('https://xivapi.com/Action?columns=ID,Icon,Name_*'),
    getAllPages('https://xivapi.com/CraftAction?columns=ID,Icon,Name_*')
  ).subscribe(page => {
    page.Results.forEach(action => {
      icons[action.ID] = action.Icon;
      // Removing migrated crafting actions
      if ([100009, 281].indexOf(action.ID) === -1) {
        if (action.ID > 100000) {
          craftActions[action.ID] = {
            en: action.Name_en,
            de: action.Name_de,
            ja: action.Name_ja,
            fr: action.Name_fr
          };
        }
        if (action.ID < 100000) {
          actions[action.ID] = {
            en: action.Name_en,
            de: action.Name_de,
            ja: action.Name_ja,
            fr: action.Name_fr
          };
        }
      }
    });
  }, null, () => {
    persistToJsonAsset('action-icons', icons);
    persistToJsonAsset('actions', actions);
    persistToJsonAsset('craft-actions', craftActions);
    done('actions');
  });
}

if (hasTodo('reductions')) {
  // Base handmade data
  const reductions = {
    12936: [5214, 5218, 12968, 12971],
    12937: [12966, 12967, 12969, 12972],
    12938: [5220, 5224],
    12939: [12970, 12973],
    12940: [12831, 12833],
    15648: [15948, 15949],
    20014: [20009, 19916, 20181],
    20015: [20010],
    20013: [20012, 20011, 20180],
    20017: [20024],
    20016: [19937],
    23182: [23220, 23221]
  };
  const items = require('../../apps/client/src/assets/data/items.json');
  const sheetRows = [];
  // Credits to Hiems Whiterock / M'aila Batih for the data sheet
  fs.createReadStream(path.join(__dirname, 'input/shb-fish-desynth.csv'), 'utf-8')
    .pipe(csv())
    .on('data', (row) => {
      sheetRows.push(row);
    })
    .on('end', () => {
      // Pop first item, as it's the credit row
      sheetRows.pop();
      sheetRows.forEach((row, index) => {
        const itemReductions = [];
        const itemId = +Object.keys(items).find(key => items[key].en.toLowerCase() === row.Item.toLowerCase());
        if (isNaN(itemId)) {
          // console.log('Invalid row', index, row);
        } else {
          for (let i = 0; i < 5; i++) {
            if (row[`r${i}`] && row[`r${i}`].length > 0) {
              const reductionId = +Object.keys(items).find(key => items[key].en.toLowerCase() === row[`r${i}`].toLowerCase());
              if (isNaN(reductionId)) {
                // console.log('Invalid row reduction', index, i, row);
              } else {
                itemReductions.push(reductionId);
              }
            }
          }
          reductions[itemId] = itemReductions;
        }
      });
      persistToTypescript('reductions', 'reductions', reductions);
      done('reductions');
    });
}

if (hasTodo('monsterDrops')) {
  // Base handmade data
  const drops = {};
  const monsters = require('../../apps/client/src/assets/data/mobs.json');
  const items = require('../../apps/client/src/assets/data/items.json');
  const sheetRows = [];
  // Credits to Hiems Whiterock / M'aila Batih for the data sheet
  fs.createReadStream(path.join(__dirname, 'input/monster-drops.csv'), 'utf-8')
    .pipe(csv())
    .on('data', (row) => {
      sheetRows.push(row);
    })
    .on('end', () => {
      sheetRows.forEach((row, index) => {
        const monsterId = +Object.keys(monsters).find(key => monsters[key].en.toLowerCase() === row.Monster.toLowerCase());
        if (isNaN(monsterId)) {
          // console.log('Invalid row', index, row);
        } else {
          const dropNames = row.Drops.split(',');
          const monsterDrops = [];
          for (const dropName of dropNames) {
            const name = dropName.trim();
            const itemId = +Object.keys(items).find(key => items[key].en.toLowerCase() === name.toLowerCase());
            if (isNaN(itemId)) {
              // console.log('Invalid row drop', index, row, name);
            } else {
              monsterDrops.push(itemId);
            }
          }
          drops[monsterId] = monsterDrops;
        }
      });
      persistToTypescript('monster-drops', 'monsterDrops', drops);
      done('monsterDrops');
    });
}

if (hasTodo('stats')) {
  const stats = [];
  getAllPages('https://xivapi.com/BaseParam?columns=ID,Name_*').subscribe(page => {
    page.Results.forEach(baseParam => {
      stats.push({
        id: baseParam.ID,
        en: baseParam.Name_en,
        de: baseParam.Name_de,
        ja: baseParam.Name_ja,
        fr: baseParam.Name_fr,
        filterName: baseParam.Name_en.split(' ').join('')
      });
    });
  }, null, () => {
    persistToTypescript('stats', 'stats', stats);
    done('stats');
  });
}

if (hasTodo('patchContent')) {
  const patchContent = {};
  get('https://xivapi.com/patchlist').pipe(
    switchMap(patchList => {
      return combineLatest(patchList.map(patch => {
        return aggregateAllPages(`https://xivapi.com/search?indexes=achievement,action,craftaction,fate,instancecontent,item,leve,placename,bnpcname,enpcresident,quest,status,trait&filters=Patch=${patch.ID}`, undefined, `Patch ${patch.Version}`)
          .pipe(
            map(pages => {
              return {
                patchId: patch.ID,
                content: pages
              };
            })
          );
      }));
    })
  ).subscribe(pages => {
    pages.forEach(page => {
      (page.content || []).forEach(entry => {
        patchContent[page.patchId] = patchContent[page.patchId] || {};
        if ((patchContent[page.patchId][entry._] || []).indexOf(entry.ID) === -1) {
          patchContent[page.patchId][entry._] = [...(patchContent[page.patchId][entry._] || []), entry.ID];
        }
      });
    });
  }, null, () => {
    persistToJsonAsset('patch-content', patchContent);
    done('patchContent');
  });
}

if (hasTodo('voyages')) {
  const airshipVoyages = [];
  const submarineVoyages = [];
  getAllPages('https://xivapi.com/AirshipExplorationPoint?columns=ID,NameShort_*').subscribe(page => {
    page.Results.forEach(voyage => {
      airshipVoyages.push({
        id: voyage.ID,
        en: voyage.NameShort_en,
        de: voyage.NameShort_de,
        ja: voyage.NameShort_ja,
        fr: voyage.NameShort_fr
      });
    });
  }, null, () => {
    persistToTypescript('airship-voyages', 'airshipVoyages', airshipVoyages);
    done('voyages');
  });

  getAllPages('https://xivapi.com/SubmarineExploration?columns=ID,Destination_*').subscribe(page => {
    page.Results.forEach(voyage => {
      submarineVoyages.push({
        id: voyage.ID,
        en: voyage.Destination_en,
        de: voyage.Destination_de,
        ja: voyage.Destination_ja,
        fr: voyage.Destination_fr
      });
    });
  }, null, () => {
    persistToTypescript('submarine-voyages', 'submarineVoyages', submarineVoyages);
    done('voyages');
  });
}

if (hasTodo('worlds')) {
  const worlds = {};
  getAllPages('https://xivapi.com/World?columns=ID,Name').subscribe(page => {
    page.Results.forEach(world => {
      worlds[world.Name.toLowerCase()] = world.ID;
    });
  }, null, () => {
    persistToTypescript('worlds', 'worlds', worlds);
    done('worlds');
  });
}

if (hasTodo('territories')) {
  const territories = {};
  getAllPages('https://xivapi.com/TerritoryType?columns=ID,PlaceName.ID').subscribe(page => {
    page.Results.forEach(territory => {
      territories[territory.ID] = territory.PlaceName.ID;
    });
  }, null, () => {
    persistToTypescript('territories', 'territories', territories);
    done('territories');
  });
}

// if (hasTodo('suggestedValues')) {
//   const suggested = {};
//   getAllPages('https://xivapi.com/RecipeLevelTable?columns=ID,SuggestedControl,SuggestedCraftsmanship').subscribe(page => {
//     page.Results.forEach(entry => {
//       suggested[entry.ID] = {
//         craftsmanship: entry.SuggestedCraftsmanship,
//         control: entry.SuggestedControl
//       };
//     });
//   }, null, () => {
//     persistToTypescript('suggested', 'suggested', suggested);
//   });
// }

if (hasTodo('HWDCrafter')) {
  const supplies = {};
  getAllEntries('https://xivapi.com/HWDCrafterSupply').subscribe(completeFetch => {
    completeFetch.forEach(supply => {
      for (let i = 0; i < 5; i++) {
        const baseReward = supply[`BaseCollectableReward${i}`];
        supplies[supply[`ItemTradeIn${i}TargetID`]] = {
          level: supply[`Level${i}`],
          base: {
            rating: supply[`BaseCollectableRating${i}`],
            exp: baseReward ? baseReward.ExpReward : 0,
            scrip: baseReward ? baseReward.ScriptRewardAmount : 0
          },
          mid: {
            rating: supply[`MidBaseCollectableRating${i}`],
            exp: supply[`MidCollectableReward${i}`].ExpReward,
            scrip: supply[`MidCollectableReward${i}`].ScriptRewardAmount
          },
          high: {
            rating: supply[`HighBaseCollectableRating${i}`],
            exp: supply[`HighCollectableReward${i}`].ExpReward,
            scrip: supply[`HighCollectableReward${i}`].ScriptRewardAmount
          }
        };
      }
    });
    persistToTypescript('hwd-supplies', 'hwdSupplies', supplies);
    done('HWDCrafter');
  });
}


if (hasTodo('HWDGatherer')) {
  const inspections = [];
  getAllEntries('https://xivapi.com/HWDGathererInspection').subscribe(completeFetch => {
    completeFetch.forEach(inspection => {
      for (let i = 0; i < 32; i++) {
        if (inspection[`ItemRequired${i}`] === null) {
          return;
        }
        inspections.push({
          requiredItem: inspection[`ItemRequired${i}`].Item,
          amount: inspection[`AmountRequired${i}`],
          receivedItem: inspection[`ItemReceived${i}`].ID,
          scrips: inspection[`Reward1${i}`].Scrips,
          points: inspection[`Reward1${i}`].Points,
          phase: inspection[`Phase${i}TargetID`]
        });
      }
    });
    persistToJsonAsset('hwd-inspections', inspections);
    done('HWDGatherer');
  });
}

if (hasTodo('HWDPhases')) {
  const gathererInspectTerm = {};
  getAllPages(`https://xivapi.com/HWDGathereInspectTerm?columns=ID,Name_*`).subscribe(page => {
    page.Results.forEach(entry => {
      gathererInspectTerm[entry.ID] = {
        en: entry.Name_en,
        ja: entry.Name_ja,
        de: entry.Name_de,
        fr: entry.Name_fr
      };
    });
  }, null, () => {
    persistToJsonAsset('hwd-phases', gathererInspectTerm);
    done('HWDPhases');
  });
}

if (hasTodo('actionTimeline')) {
  const actionTimeline = {};
  getAllPages('https://xivapi.com/ActionTimeline?columns=ID,Key').subscribe(page => {
    page.Results.forEach(entry => {
      actionTimeline[entry.ID] = entry.Key;
    });
  }, null, () => {
    persistToJsonAsset('action-timeline', actionTimeline);
    done('actionTimeline');
  });
}

if (hasTodo('materias')) {
  const materiaColumns = [
    'ID',
    'Value0',
    'Value1',
    'Value2',
    'Value3',
    'Value4',
    'Value5',
    'Value6',
    'Value7',
    'Value8',
    'Value9',
    'Item0TargetID',
    'Item1TargetID',
    'Item2TargetID',
    'Item3TargetID',
    'Item4TargetID',
    'Item5TargetID',
    'Item6TargetID',
    'Item7TargetID',
    'Item8TargetID',
    'Item9TargetID',
    'BaseParamTargetID'
  ];
  const materias = [];
  getAllPages(`https://xivapi.com/Materia?columns=${materiaColumns.join(',')}`).subscribe(page => {
    page.Results
      .filter(entry => entry.Item0 !== null && entry.Value0 > 0)
      .forEach(entry => {
        Object.entries(entry)
          .filter(([key, itemId]) => /Item\dTargetID/.test(key) && itemId > 0)
          .forEach(([key, itemId]) => {
            const index = +/Item(\d)TargetID/.exec(key)[1];
            const value = entry[`Value${index}`];
            if (value > 0) {
              materias.push({
                id: entry.ID,
                itemId: itemId,
                tier: index + 1,
                value: entry[`Value${index}`],
                baseParamId: entry.BaseParamTargetID
              });
            }
          });
      });
  }, null, () => {
    persistToJsonAsset('materias', materias);
    done('materias');
  });
}

if (hasTodo('baseParam')) {
  const baseParams = {};
  const baseParamColumns = [
    'ID',
    'Name_*',
    'MeldParam0',
    'MeldParam1',
    'MeldParam2',
    'MeldParam3',
    'MeldParam4',
    'MeldParam5',
    'MeldParam6',
    'MeldParam7',
    'MeldParam8',
    'MeldParam9',
    'MeldParam10',
    'MeldParam11',
    'MeldParam12',
    '1HWpn%',
    '2HWpn%',
    'Bracelet%',
    'Chest%',
    'ChestHead%',
    'ChestHeadLegsFeet%',
    'ChestLegsFeet%',
    'ChestLegsGloves%',
    'Earring%',
    'Feet%',
    'Hands%',
    'Head%',
    'HeadChestHandsLegsFeet%',
    'Legs%',
    'LegsFeet%',
    'Necklace%',
    'OH%',
    'Order',
    'Ring%',
    'Waist%'
  ];
  getAllPages(`https://xivapi.com/BaseParam?columns=${baseParamColumns.join(',')}`).subscribe(page => {
    page.Results.forEach(entry => {
      baseParams[entry.ID] = entry;
    });
  }, null, () => {
    persistToJsonAsset('base-params', baseParams);
    done('baseParam');
  });
}

if (hasTodo('itemLevel')) {
  const itemLevel = {};
  const itemLevelColumns = [
    'AdditionalEffect',
    'AttackMagicPotency',
    'AttackPower',
    'AttackSpeed',
    'BindResistance',
    'BlindResistance',
    'BlockRate',
    'BlockStrength',
    'BluntResistance',
    'CP',
    'CarefulDesynthesis',
    'Control',
    'Craftsmanship',
    'CriticalHit',
    'CriticalHitEvasion',
    'CriticalHitPower',
    'CriticalHitResilience',
    'Defense',
    'Delay',
    'Determination',
    'Dexterity',
    'DirectHitRate',
    'DoomResistance',
    'EXPBonus',
    'EarthResistance',
    'EnfeeblingMagicPotency',
    'EnhancementMagicPotency',
    'Enmity',
    'EnmityReduction',
    'Evasion',
    'FireResistance',
    'GP',
    'GameContentLinks',
    'Gathering',
    'HP',
    'Haste',
    'HealingMagicPotency',
    'HeavyResistance',
    'ID',
    'IceResistance',
    'IncreasedSpiritbondGain',
    'Intelligence',
    'LightningResistance',
    'MP',
    'MagicDefense',
    'MagicResistance',
    'MagicalDamage',
    'Mind',
    'Morale',
    'MovementSpeed',
    'ParalysisResistance',
    'Patch',
    'Perception',
    'PetrificationResistance',
    'PhysicalDamage',
    'PiercingResistance',
    'Piety',
    'PoisonResistance',
    'ProjectileResistance',
    'ReducedDurabilityLoss',
    'Refresh',
    'Regen',
    'SilenceResistance',
    'SkillSpeed',
    'SlashingResistance',
    'SleepResistance',
    'SlowResistance',
    'SpellSpeed',
    'Spikes',
    'Strength',
    'StunResistance',
    'TP',
    'Tenacity',
    'Vitality',
    'WaterResistance',
    'WindResistance'
  ];
  getAllPages(`https://xivapi.com/ItemLevel?columns=${itemLevelColumns.join(',')}`).subscribe(page => {
    page.Results.forEach(entry => {
      itemLevel[entry.ID] = entry;
    });
  }, null, () => {
    persistToJsonAsset('item-level', itemLevel);
    done('itemLevel');
  });
}

if (hasTodo('classJobModifiers')) {
  const ClassJobs = {};
  const ClassJobsColumns = [
    'ID',
    'ModifierDexterity',
    'ModifierHitPoints',
    'ModifierIntelligence',
    'ModifierManaPoints',
    'ModifierMind',
    'ModifierPiety',
    'ModifierStrength',
    'ModifierVitality',
    'PrimaryStat',
    'Role'
  ];
  getAllPages(`https://xivapi.com/ClassJob?columns=${ClassJobsColumns.join(',')}`).subscribe(page => {
    page.Results.forEach(entry => {
      ClassJobs[entry.ID] = entry;
    });
  }, null, () => {
    persistToJsonAsset('class-jobs-modifiers', ClassJobs);
    done('classJobModifiers');
  });
}

if (hasTodo('equipSlotCategories')) {
  const equipSlotCategories = {};
  getAllEntries(`https://xivapi.com/EquipSlotCategory`).subscribe(completeFetch => {
    completeFetch.forEach(entry => {
      delete entry.GameContentLinks;
      equipSlotCategories[entry.ID] = entry;
    });
    persistToJsonAsset('equip-slot-categories', equipSlotCategories);
    done('equipSlotCategories');
  });
}

if (hasTodo('tribes')) {
  const tribes = {};
  getAllEntries(`https://xivapi.com/Tribe`).subscribe(completeFetch => {
    completeFetch.forEach(entry => {
      delete entry.GameContentLinks;
      delete entry.GamePatch;
      delete entry.NameFemale;
      delete entry.NameFemale_de;
      delete entry.NameFemale_en;
      delete entry.NameFemale_fr;
      delete entry.NameFemale_ja;
      delete entry.Patch;
      delete entry.Url;
      tribes[entry.ID] = entry;
    });
    persistToJsonAsset('tribes', tribes);
    done('tribes');
  });
}

if (hasTodo('races')) {
  const races = {};
  getAllPages(`https://xivapi.com/Race?columns=ID,Name_*`).subscribe(page => {
    page.Results.forEach(entry => {
      races[entry.ID] = {
        en: entry.Name_en,
        ja: entry.Name_ja,
        de: entry.Name_de,
        fr: entry.Name_fr
      };
    });
  }, null, () => {
    persistToJsonAsset('races', races);
    done('races');
  });
}

if (hasTodo('foods')) {
  const foods = [];
  getAllPages('https://xivapi.com/Search?indexes=items&filters=ItemSearchCategory.ID=45&columns=ID,Bonuses,LevelItem,LevelEquip').subscribe(page => {
    page.Results.forEach(entry => {
      if (entry.Bonuses) {
        foods.push(entry);
      }
    });
  }, null, () => {
    persistToJsonAsset('foods', foods);
    done('foods');
  });
}

if (hasTodo('paramGrow')) {
  const paramGrow = {};
  getAllPages('https://xivapi.com/Paramgrow?columns=AdditionalActions,ApplyAction,BaseSpeed,CraftingLevel,ExpToNext,GameContentLinks,HpModifier,HuntingLogExpReward,ID,ItemLevelSync,LevelModifier,MonsterNoteSeals,MpModifier,Patch,ProperDungeon,ProperGuildOrder,QuestExpModifier,ScaledQuestXP').subscribe(page => {
    page.Results.forEach(entry => {
      paramGrow[entry.ID] = entry;
    });
  }, null, () => {
    persistToJsonAsset('param-grow', paramGrow);
    done('paramGrow');
  });
}
