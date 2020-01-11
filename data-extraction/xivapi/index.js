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

let todo = [
  'gatheringLog',
  'map',
  'craftingLog',
  'weather',
  'fishingLog',
  'itemIcons',
  'spearFishingLog',
  'aetherstream',
  'maps',
  'tripleTriadRules',
  'quests',
  'fates',
  'instances',
  'shops',
  'leves',
  'jobCategories',
  'mobs',
  'hunts',
  'gatheringBonuses',
  'cdGroups',
  'combos',
  'statuses',
  'traits',
  'items',
  'aetherytes',
  'achievements',
  'recipes',
  'actions',
  'monsterDrops',
  'voyages',
  'worlds',
  'territories',
  'actionTimeline',
  'suggestedValues',
  'patchContent',
  'places'
];

const onlyIndex = process.argv.indexOf('--only');
if (onlyIndex > -1) {
  todo = [...process.argv.slice(onlyIndex + 1)];
}

const everything = process.argv.indexOf('--everything') > -1;

function hasTodo(operation) {
  let matches = todo.indexOf(operation) > -1;
  if (everything) {
    matches = true;
  }
  if (matches) {
    console.log(`========== ${operation} ========== `);
  }
  return matches;
}

fs.existsSync('output') || fs.mkdirSync('output');

let emptyBnpcNames = 0;

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
      console.log('Extracted memory data, size: ', parsedMemoryData.length);
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
          console.log('nodes written');
          persistToTypescript('aetherytes', 'aetherytes', aetherytes);
          console.log('aetherytes written');
          persistToJsonAsset('monsters', monsters);
          console.log('monsters written', emptyBnpcNames);
          persistToJsonAsset('npcs', npcs);
          console.log('npcs written');
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
  craftingLogPages[entry.CraftType] = craftingLogPages[entry.CraftType] || [];
  let page = craftingLogPages[entry.CraftType].find(page => page.id === pageId);
  if (page === undefined) {
    craftingLogPages[entry.CraftType].push({
      id: pageId,
      masterbook: entry.SecretRecipeBook,
      startLevel: entry.RecipeLevelTable,
      recipes: []
    });
    page = craftingLogPages[entry.CraftType].find(page => page.id === pageId);
  }
  page.recipes.push({
    recipeId: entry.ID,
    itemId: entry.ItemResult,
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
    getAllEntries('https://xivapi.com/RecipeNotebookList', '63cc0045d7e847149c3f', true),
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
          entry.RecipeLevelTable = rlvlTable[entry.RecipeLevelTable];
          craftingLog[entry.CraftType].push(entry.ID);
          addToCraftingLogPage(entry, page.ID);
        });
    });
    persistToJsonAsset('crafting-log', craftingLog);
    persistToJsonAsset('crafting-log-pages', craftingLogPages);
  });
}


if (hasTodo('gatheringLog')) {

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
  });

}

if (hasTodo('fishingLog')) {

  const fishingLog = [];

  getAllEntries('https://xivapi.com/FishParameter', '63cc0045d7e847149c3f', true).pipe(
    map(completeFetch => {
      const fishParameter = {};
      completeFetch
        .filter(fish => fish.Item !== null && fish.IsInLog === 1)
        .forEach(fish => {
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

  getAllEntries('https://xivapi.com/FishingSpot', '63cc0045d7e847149c3f', true).subscribe((completeFetch) => {
    const spots = [];
    const fishes = [];
    completeFetch
      .filter(spot => spot.Item0 !== null && spot.TerritoryType !== null)
      .forEach(spot => {
        const c = spot.TerritoryType.Map.SizeFactor / 100.0;
        spots.push({
          id: spot.ID,
          mapId: spot.TerritoryType.Map.ID,
          placeId: spot.TerritoryType.PlaceName.ID,
          zoneId: spot.PlaceName.ID,
          coords: {
            x: (41.0 / c) * ((spot.X) / 2048.0) + 1,
            y: (41.0 / c) * ((spot.Z) / 2048.0) + 1
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
                  x: (41.0 / c) * ((spot.X) / 2048.0) + 1,
                  y: (41.0 / c) * ((spot.Z) / 2048.0) + 1
                }
              }
            };
            fishingLog.push(entry);
          });
      });
    persistToJsonAsset('fishing-log', fishingLog);
    persistToJsonAsset('fishing-spots', spots);
    persistToJsonAsset('fishes', fishes);
  });

}

if (hasTodo('spearFishingLog')) {

  const sheetEntries = [];

  fs.createReadStream(path.join(__dirname, 'csv/FFXIV Data - Fishing.csv'))
    .pipe(csv())
    .on('data', (data) => sheetEntries.push(data))
    .on('end', () => {

      const spearFishingLog = [];

      getAllEntries('https://xivapi.com/SpearfishingNotebook', '63cc0045d7e847149c3f', true).subscribe(completeFetch => {
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
                    x: (41.0 / c) * ((entry.X) / 2048.0) + 1,
                    y: (41.0 / c) * ((entry.Y) / 2048.0) + 1
                  }
                };
              });
            spearFishingLog.push(...entries);
          });
        persistToTypescript('spear-fishing-log', 'spearFishingLog', spearFishingLog);
      });

      const spearFishingNodes = [];

      getAllEntries('https://xivapi.com/SpearfishingItem', '63cc0045d7e847149c3f', true).subscribe(completeFetch => {
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
      });
    });
}


if (hasTodo('weather')) {
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
  });
}

if (hasTodo('fates')) {
  const fates = {};
  const fatesDone$ = new Subject();
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
    fatesDone$.next();
  });

  const mapData = require('../../apps/client/src/assets/data/maps.json');

  const levelLGB$ = fileStreamObservable(path.join(__dirname, 'input/LevelLGB.csv'));
  fatesDone$.pipe(
    switchMap(() => {
      return levelLGB$.pipe(
        buffer(levelLGB$.pipe(debounceTime(500)))
      );
    })
  ).subscribe(csvData => {
    Object.keys(fates).forEach(key => {
      const location = csvData.find(row => +row.LocationID === fates[key].location);
      if (!location) {
        delete fates[key].location;
        return;
      }
      const c = mapData[location.Map].size_factor / 100;
      fates[key].position = {
        zoneid: +mapData[location.Map].placename_id,
        x: Math.floor(10 * (41.0 / c) * ((location.X) / 2048.0) + 1) / 10,
        y: Math.floor(10 * (41.0 / c) * ((location.Z) / 2048.0) + 1) / 10
      };
      delete fates[key].location;
    });
    persistToJsonAsset('fates', fates);
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
  });
}

if (hasTodo('items')) {
  const names = {};
  const rarities = {};
  const itemIcons = {};
  const ilvls = {};
  const stackSizes = {};
  const itemSlots = {};
  getAllPages('https://xivapi.com/Item?columns=ID,Name_*,Rarity,GameContentLinks,Icon,LevelItem,StackSize,EquipSlotCategoryTargetID').subscribe(page => {
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
    });
  }, null, () => {
    persistToJsonAsset('item-icons', itemIcons);
    persistToJsonAsset('items', names);
    persistToJsonAsset('rarities', rarities);
    persistToJsonAsset('ilvls', ilvls);
    persistToJsonAsset('stack-sizes', stackSizes);
    persistToJsonAsset('item-slots', itemSlots);
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
  });
}

if (hasTodo('recipes')) {
  const recipes = [];
  getAllPages('https://xivapi.com/Recipe?columns=ID,ClassJob.ID,CanQuickSynth,RecipeLevelTable,AmountResult,ItemResultTargetID,ItemIngredient0TargetID,ItemIngredient1TargetID,ItemIngredient2TargetID,ItemIngredient3TargetID,ItemIngredient4TargetID,ItemIngredient5TargetID,ItemIngredient6TargetID,ItemIngredient7TargetID,ItemIngredient8TargetID,ItemIngredient9TargetID,AmountIngredient0,AmountIngredient1,AmountIngredient2,AmountIngredient3,AmountIngredient4,AmountIngredient5,AmountIngredient6,AmountIngredient7,AmountIngredient8,AmountIngredient9').subscribe(page => {
    page.Results.forEach(recipe => {
      if (recipe.RecipeLevelTable === null) {
        return;
      }
      recipes.push({
        id: recipe.ID,
        job: recipe.ClassJob.ID,
        level: recipe.RecipeLevelTable.ClassJobLevel,
        yields: recipe.AmountResult,
        result: recipe.ItemResultTargetID,
        stars: recipe.RecipeLevelTable.Stars,
        qs: recipe.CanQuickSynth === 1,
        rlvl: recipe.RecipeLevelTable.ID,
        ingredients: Object.keys(recipe)
          .filter(k => /ItemIngredient\dTargetID/.test(k))
          .sort((a, b) => a < b ? -1 : 1)
          .filter(key => recipe[key] > 19)
          .map((key, index) => {
            return {
              id: recipe[key],
              amount: +recipe[`AmountIngredient${index}`]
            };
          })
      });
    });
  }, null, () => {
    persistToJsonAsset('recipes', recipes);
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
          console.log('Invalid row', index, row);
        } else {
          for (let i = 0; i < 5; i++) {
            if (row[`r${i}`] && row[`r${i}`].length > 0) {
              const reductionId = +Object.keys(items).find(key => items[key].en.toLowerCase() === row[`r${i}`].toLowerCase());
              if (isNaN(reductionId)) {
                console.log('Invalid row reduction', index, i, row);
              } else {
                itemReductions.push(reductionId);
              }
            }
          }
          reductions[itemId] = itemReductions;
        }
      });
      persistToTypescript('reductions', 'reductions', reductions);
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
          console.log('Invalid row', index, row);
        } else {
          const dropNames = row.Drops.split(',');
          const monsterDrops = [];
          for (const dropName of dropNames) {
            const name = dropName.trim();
            const itemId = +Object.keys(items).find(key => items[key].en.toLowerCase() === name.toLowerCase());
            if (isNaN(itemId)) {
              console.log('Invalid row drop', index, row, name);
            } else {
              monsterDrops.push(itemId);
            }
          }
          drops[monsterId] = monsterDrops;
        }
      });
      persistToTypescript('monster-drops', 'monsterDrops', drops);
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
  });
}

if (hasTodo('suggestedValues')) {
  const suggested = {};
  getAllPages('https://xivapi.com/RecipeLevelTable?columns=ID,SuggestedControl,SuggestedCraftsmanship').subscribe(page => {
    page.Results.forEach(entry => {
      suggested[entry.ID] = {
        craftsmanship: entry.SuggestedCraftsmanship,
        control: entry.SuggestedControl
      };
    });
  }, null, () => {
    persistToTypescript('suggested', 'suggested', suggested);
  });
}

if (hasTodo('HWDData')) {
  const supplies = {};
  getAllEntries('https://xivapi.com/HWDCrafterSupply').subscribe(completeFetch => {
    completeFetch.forEach(supply => {
      for (let i = 0; i < 5; i++) {
        supplies[supply[`ItemTradeIn${i}TargetID`]] = {
          level: supply[`Level${i}`],
          base: {
            rating: supply[`BaseCollectableRating${i}`],
            exp: supply[`BaseCollectableReward${i}`].ExpReward,
            scrip: supply[`BaseCollectableReward${i}`].ScriptRewardAmount
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
  });
}
