const csv = require('csv-parser');
const path = require('path');
const fs = require('fs');
const http = require('https');
const Rx = require('rxjs');
const { map, switchMap, mergeMap, first } = require('rxjs/operators');
const { Subject, combineLatest } = require('rxjs');
const { getAllPages, persistToJson, persistToJsonAsset, persistToTypescript, getAllEntries, get } = require('./tools.js');

const nodes = {};
const gatheringPointToBaseId = {};
const aetherytes = [];
const monsters = {};
const npcs = {};

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
  'aetherytes'
];

const onlyIndex = process.argv.indexOf('--only');
if (onlyIndex > -1) {
  todo = [process.argv[onlyIndex + 1]];
}

function hasTodo(operation) {
  return todo.indexOf(operation) > -1;
}

fs.existsSync('output') || fs.mkdirSync('output');

if (hasTodo('mappy')) {
  // MapData extraction
  const memoryData$ = new Rx.Subject();
  const mapData$ = new Rx.Subject();
  const npcs$ = new Rx.Subject();
  const nodes$ = new Rx.Subject();
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

  const gatheringItems$ = new Rx.Subject();
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
    persistToTypescript('gathering-items', 'gatheringItems', gatheringItems);
    gatheringItems$.next(gatheringItems);
  });

  gatheringItems$.pipe(
    mergeMap(gatheringItems => {
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

  Rx.combineLatest([memoryData$, mapData$, nodes$, npcs$])
    .subscribe(([memoryData, res]) => {
      res.setEncoding('utf8');
      res.pipe(csv())
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
          persistToJson('node-positions', nodes);
          console.log('nodes written');
          // persistToTypescript('aetherytes', 'aetherytes', aetherytes);
          // console.log('aetherytes written');
          persistToJson('monsters', monsters);
          console.log('monsters written');
          persistToJsonAsset('npcs', npcs);
          console.log('npcs written');
          // mappyDone$.next();
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
  aetherytes.push({
    id: row.ENpcResidentID === '2147483647' ? 12 : +row.ENpcResidentID,
    zoneid: +row.PlaceNameID,
    map: +row.MapID,
    placenameid: +row.PlaceNameID,
    x: Math.round(+row.PosX * 10) / 10,
    y: Math.round(+row.PosY * 10) / 10,
    type: isShard ? 1 : 0
  });
};

handleMonster = (row, memoryData) => {
  const monsterMemoryRow = memoryData.find(mRow => mRow.Hash === row.Hash);
  monsters[row.BNpcNameID] = monsters[row.BNpcNameID] || {
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
  monsters[row.BNpcNameID].positions.push(newEntry);
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
    stars: entry.GatheringItemLevel.Stars,
    hidden: entry.IsHidden
  });
}


if (hasTodo('craftingLog')) {
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
    persistToTypescript('gathering-log-pages', 'gatheringLogPages', gatheringLogPages);
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
    persistToTypescript('fish-parameter', 'fishParameter', fishParameter);
  });

  getAllEntries('https://xivapi.com/FishingSpot', '63cc0045d7e847149c3f', true).subscribe((completeFetch) => {
    completeFetch
      .filter(spot => spot.Item0 !== null && spot.TerritoryType !== null)
      .forEach(spot => {
        Object.keys(spot)
          .filter(key => {
            return /^Item\d+$/.test(key) && spot[key] && spot[key].ID !== -1 && spot[key].ID !== null;
          })
          .sort((a, b) => {
            return +a.match(/^Item(\d+)$/)[1] - +b.match(/^Item(\d+)$/)[1];
          })
          .forEach(key => {
            const fish = spot[key];
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
    persistToTypescript('fishing-log', 'fishingLog', fishingLog);
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

if (hasTodo('itemIcons')) {
  const itemIcons = {};
  getAllPages('https://xivapi.com/Item?key=63cc0045d7e847149c3f&columns=ID,Icon').subscribe(page => {
    page.Results.forEach(row => {
      itemIcons[row.ID] = row.Icon;
    });
  }, null, () => {
    persistToJsonAsset('item-icons', itemIcons);
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
  getAllPages('https://xivapi.com/Quest?columns=ID,Name_*,Icon').subscribe(page => {
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
    });
  }, null, () => {
    persistToJsonAsset('quests', quests);
  });
}

if (hasTodo('fates')) {
  const fates = {};
  const fatesDone$ = new Subject();
  getAllPages('https://xivapi.com/Fate?columns=ID,Name_*,Description_*,IconMap,ClassJobLevel').subscribe(page => {
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
        level: fate.ClassJobLevel
      };
    });
  }, null, () => {
    fatesDone$.next();
  });

  fatesDone$.pipe(
    first(),
    switchMap(() => {
      return combineLatest(Object.keys(fates).map(fateId => {
        return get(`http://www.garlandtools.org/db/doc/fate/en/2/${fateId}.json`);
      }));
    })
  ).subscribe((gtFates) => {
    gtFates.forEach(gtFate => {
      if (gtFate && gtFate.fate && gtFate.fate.zoneid && gtFate.fate.coords) {
        fates[gtFate.fate.id].position = {
          zoneid: gtFate.fate.zoneid,
          x: gtFate.fate.coords[0],
          y: gtFate.fate.coords[1]
        };
      }
    });
    persistToJsonAsset('fates', fates);
  });
}

if (hasTodo('instances')) {
  const instances = {};
  getAllPages('https://xivapi.com/InstanceContent?columns=ID,Name_*,Icon,InstanceContentTextDataBossEndTargetID,InstanceContentTextDataBossStartTargetID,InstanceContentTextDataObjectiveEndTargetID,InstanceContentTextDataObjectiveStartTargetID').subscribe(page => {
    page.Results.forEach(instance => {
      instances[instance.ID] = {
        en: instance.Name_en,
        ja: instance.Name_ja,
        de: instance.Name_de,
        fr: instance.Name_fr,
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
      persistToTypescript('hunts', 'hunts', hunts);
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
    persistToTypescript('action-cd-groups', 'actionCdGroups', groups);
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
  getAllPages('https://xivapi.com/Status?columns=ID,Name_*').subscribe(page => {
    page.Results.forEach(status => {
      statuses[status.ID] = {
        en: status.Name_en,
        de: status.Name_de,
        ja: status.Name_ja,
        fr: status.Name_fr
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
  getAllPages('https://xivapi.com/Item?columns=ID,Name_*,Rarity').subscribe(page => {
    page.Results.forEach(item => {
      names[item.ID] = {
        en: item.Name_en,
        de: item.Name_de,
        ja: item.Name_ja,
        fr: item.Name_fr
      };
      rarities[item.ID] = item.Rarity;
    });
  }, null, () => {
    persistToJsonAsset('items', names);
    persistToTypescript('rarities', 'rarities', rarities);
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
