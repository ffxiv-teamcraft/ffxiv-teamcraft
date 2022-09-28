import { combineLatest, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { AbstractExtractor } from '../abstract-extractor';

export class LogsExtractor extends AbstractExtractor {
  private craftingLog = [
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    []
  ];

  private craftingLogPages = [
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    []
  ];

  private gatheringLogPages = [
    [],
    [],
    [],
    []
  ];


  private craftingLogDone$ = new Subject<void>();

  private gatheringLogDone$ = new Subject<void>();

  private fishingLogDone$ = new Subject<void>();

  private spearFishingLogDone$ = new Subject<void>();

  private spearFishingNodesDone$ = new Subject<void>();

  private notebookDivision = {};

  protected doExtract(): any {
    const notebookDivisionDone$ = new Subject<void>();

    combineLatest([this.craftingLogDone$, notebookDivisionDone$, this.gatheringLogDone$,
      this.fishingLogDone$, this.spearFishingNodesDone$, this.spearFishingLogDone$])
      .subscribe(() => {
        this.extractRequiredLevels();
        this.done();
      });
    this.getAllEntries('https://xivapi.com/NotebookDivision', true).subscribe(completeFetch => {
      completeFetch.forEach(row => {
        this.notebookDivision[row.ID] = {
          name: {
            en: row.Name_en,
            ja: row.Name_ja,
            de: row.Name_de,
            fr: row.Name_fr
          },
          pages: [0, 1, 2, 3, 4, 5, 6, 7]
            .map(index => {
              if (row.ID < 1000) {
                // Level ranges
                return 40 * index + row.ID;
              } else if (row.ID < 2000) {
                // DoH masterbooks
                return 1000 + 8 * (row.ID - 1000) + index;
              } else if (row.ID >= 2010 && row.ID <= 2012) {
                return [
                  // Quarrying, Mining, Logging, Harvesting
                  [2025, 2024, 2026, 2027], // Ilsabard
                  [2028, 2029, -1, 2031], // Sea of Stars
                  [2033, -1, 2034, -1]  // World Sundered
                ][row.ID - 2010][index] || -1;
              } else if ([2006, 2007, 2008, 2009].includes(row.ID)) {
                return -1;
              } else {
                // DoL folklores, only 4 DoLs tho
                return index < 4 ? (2000 + 4 * (row.ID - 2000) + index) : -1;
              }
            }),
          craftLevel: row.CraftOpeningLevel,
          gatheringLevel: row.GatheringOpeningLevel
        };
      });
      this.persistToJsonAsset('notebook-division', this.notebookDivision);
      notebookDivisionDone$.next();
    });

    this.extractCraftingLog();
    this.extractGatheringLog();
    this.extractFishingLog();
    this.extractSpearfishingLog();
  }

  private extractCraftingLog(): void {
    this.getAllEntries('https://xivapi.com/RecipeNotebookList', true).subscribe((completeFetch) => {
      completeFetch.forEach(page => {
        // If it's an empty page or a collectable one, don't go further
        if (!page.Recipe0 || page.Recipe0.ID === -1 || (page.ID >= 1256 && page.ID < 1280)) {
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
              this.craftingLog[entry.CraftTypeTargetID].push(entry.ID);
              this.addToCraftingLogPage(entry, page.ID);
            } catch (e) {
              console.log(e);
              console.log(entry);
            }
          });
      });
      this.persistToJsonAsset('crafting-log', this.craftingLog);
      this.persistToJsonAsset('crafting-log-pages', this.craftingLogPages);
      this.craftingLogDone$.next();
    });
  }

  private extractGatheringLog(): void {
    this.getAllEntries('https://xivapi.com/GatheringNotebookList', true).subscribe(completeFetch => {
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
            if (page.ID >= 2200) {
              return;
            }
            const pageId = page.ID;
            const entry = page[key];
            // 0 = MIN, 1 = MIN (quarrying), 2 = BTN, 3 = BTN (grass thing)
            let gathererIndex;
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
            }
            this.addToGatheringLogPage(entry, pageId, gathererIndex);
          });
      });
      this.persistToJsonAsset('gathering-log-pages', this.gatheringLogPages);
      this.gatheringLogDone$.next();
    });
  }

  private extractFishingLog(): void {
    const diademTerritory = require('../../../input/diadem-territory.json');

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
    const fishes = [];

    this.aggregateAllPages('https://xivapi.com/FishParameter?columns=ID,ItemTargetID,Item.Icon,TerritoryType.MapTargetID,TerritoryType.PlaceNameTargetID,GatheringItemLevel,TimeRestricted,WeatherRestricted,FishingRecordType,IsInLog,GatheringSubCategory').pipe(
      map(completeFetch => {
        const fishParameter = {};
        completeFetch
          .filter(fish => fish.ItemTargetID > 0)
          .forEach(fish => {
            if (fish.TerritoryType === null) {
              throw new Error(`No territory for FishParameter#${fish.ID}`);
            }
            if (fishes.indexOf(fish.ItemTargetID) === -1) {
              fishes.push(fish.ItemTargetID);
            }
            const entry: any = {
              id: fish.ID,
              itemId: fish.ItemTargetID,
              level: fish.GatheringItemLevel.GatheringItemLevel,
              icon: fish.Item.Icon,
              mapId: fish.TerritoryType.MapTargetID,
              zoneId: fish.TerritoryType.PlaceNameTargetID,
              timed: fish.TimeRestricted,
              weathered: fish.WeatherRestricted,
              stars: fish.GatheringItemLevel.Stars || 0
            };
            if (fish.GatheringSubCategory) {
              entry.folklore = fish.GatheringSubCategory.ItemTargetID;
            }
            if (fish.FishingRecordType && fish.FishingRecordType.Addon) {
              entry.recordType = {
                en: fish.FishingRecordType.Addon.Text_en,
                de: fish.FishingRecordType.Addon.Text_de,
                ja: fish.FishingRecordType.Addon.Text_ja,
                fr: fish.FishingRecordType.Addon.Text_fr
              };
            }
            fishParameter[fish.ItemTargetID] = entry;
          });
        return fishParameter;
      })
    ).subscribe(fishParameter => {
      this.persistToJsonAsset('fish-parameter', fishParameter);
      this.persistToJsonAsset('fishes', fishes);
    });

    this.getAllEntries('https://xivapi.com/FishingSpot', true).subscribe((completeFetch) => {
      const spots = [];
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
            level: spot.GatheringLevel,
            coords: spot.ID >= 10000 ? diademFishingSpotCoords[spot.ID] : {
              x: Math.floor(100 * (41.0 / c) * (spot.X / 2048.0) + 1) / 100 + 1,
              y: Math.floor(100 * (41.0 / c) * (spot.Z / 2048.0) + 1) / 100 + 1
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
                    x: Math.floor(100 * (41.0 / c) * (spot.X / 2048.0) + 1) / 100 + 1,
                    y: Math.floor(100 * (41.0 / c) * (spot.Z / 2048.0) + 1) / 100 + 1
                  }
                }
              };
              fishingLog.push(entry);
            });
        });
      this.persistToJsonAsset('fishing-log', fishingLog);
      this.persistToJsonAsset('fishing-spots', spots);
      this.fishingLogDone$.next();
    });
  }

  private extractSpearfishingLog(): void {

    const spearFishingLog = [];

    this.getAllEntries('https://xivapi.com/SpearfishingNotebook', true).subscribe(completeFetch => {
      completeFetch
        .filter(entry => entry.GatheringPointBase)
        .forEach(entry => {
          const entries = Object.keys(entry.GatheringPointBase)
            .filter(key => /Item\d/.test(key))
            .filter(key => entry.GatheringPointBase[key] !== null)
            .map(key => {
              const c = entry.TerritoryType.Map.SizeFactor / 100.0;
              return {
                id: entry.GatheringPointBase.ID,
                itemId: entry.GatheringPointBase[key].ItemTargetID,
                level: entry.GatheringLevel.GatheringLevel,
                mapId: entry.TerritoryType.Map.ID,
                placeId: entry.TerritoryType.PlaceName.ID,
                zoneId: entry.PlaceName.ID,
                coords: {
                  x: Math.floor(10 * (41.0 / c) * ((entry.X * c) / 2048.0) + 1) / 10,
                  y: Math.floor(10 * (41.0 / c) * ((entry.Y * c) / 2048.0) + 1) / 10
                }
              };
            });
          spearFishingLog.push(...entries);
        });
      this.persistToJsonAsset('spear-fishing-log', spearFishingLog.filter(row => !!row.itemId));
      this.spearFishingLogDone$.next();
    });

    const spearFishingFish = [];

    this.getAllPages('https://xivapi.com/SpearfishingItem?columns=ItemTargetID').subscribe(
      {
        next: page => {
          page.Results.forEach(fish => {
            spearFishingFish.push(fish.ItemTargetID);
          });
        },
        complete: () => {
          this.persistToJsonAsset('spear-fishing-fish', spearFishingFish);
          this.spearFishingNodesDone$.next();
        }
      });
  }

  private addToCraftingLogPage(entry, pageId) {
    this.craftingLogPages[entry.CraftTypeTargetID] = this.craftingLogPages[entry.CraftTypeTargetID] || [];
    let page = this.craftingLogPages[entry.CraftTypeTargetID].find(p => p.id === pageId);
    if (page === undefined) {
      this.craftingLogPages[entry.CraftTypeTargetID].push({
        id: pageId,
        masterbook: entry.SecretRecipeBook,
        startLevel: entry.RecipeLevelTable,
        recipes: []
      });
      page = this.craftingLogPages[entry.CraftTypeTargetID].find(p => p.id === pageId);
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

  private addToGatheringLogPage(entry, pageId, gathererIndex) {
    let page = this.gatheringLogPages[gathererIndex].find(p => p.id === pageId);
    if (page === undefined) {
      this.gatheringLogPages[gathererIndex].push({
        id: pageId,
        startLevel: entry.GatheringItemLevel.GatheringItemLevel,
        items: []
      });
      page = this.gatheringLogPages[gathererIndex].find(p => p.id === pageId);
    }
    page.items.push({
      itemId: entry.ItemTargetID,
      ilvl: entry.GatheringItemLevelTargetID,
      lvl: entry.GatheringItemLevel.GatheringItemLevel,
      stars: entry.GatheringItemLevel.Stars,
      hidden: entry.IsHidden
    });
  }

  getName(): string {
    return 'logs';
  }

  private extractRequiredLevels(): void {
    const gatheringLevels = {};
    const craftingLevels = {};

    Object.values<any>(this.notebookDivision)
      .forEach(division => {
        this.craftingLogPages.forEach(job => {
          job.filter(page => division.pages.includes(page.id))
            .forEach(page => {
              page.recipes.forEach(item => {
                craftingLevels[item.recipeId] = division.craftLevel;
              });
            });
        });

        this.gatheringLogPages.forEach(job => {
          job.filter(page => division.pages.includes(page.id))
            .forEach(page => {
              page.items.forEach(item => {
                gatheringLevels[item.itemId] = division.gatheringLevel;
              });
            });
        });
      });

    this.persistToJsonAsset('gathering-levels', gatheringLevels);
    this.persistToJsonAsset('crafting-levels', craftingLevels);
  }
}
