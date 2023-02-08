import { combineLatest, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { XivDataService } from '../xiv/xiv-data.service';
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

  protected xiv: XivDataService;

  protected doExtract(xiv: XivDataService): any {
    this.xiv = xiv;
    const notebookDivisionDone$ = new Subject<void>();

    combineLatest([this.craftingLogDone$, notebookDivisionDone$, this.gatheringLogDone$,
      this.fishingLogDone$, this.spearFishingNodesDone$, this.spearFishingLogDone$])
      .subscribe(() => {
        this.extractRequiredLevels();
        this.done();
      });
    this.getSheet<any>(xiv, 'NotebookDivision', ['Name', 'CraftOpeningLevel', 'GatheringOpeningLevel'], true).subscribe(completeFetch => {
      completeFetch.forEach(row => {
        this.notebookDivision[row.index] = {
          name: {
            en: row.Name_en,
            ja: row.Name_ja,
            de: row.Name_de,
            fr: row.Name_fr
          },
          pages: [0, 1, 2, 3, 4, 5, 6, 7]
            .map(index => {
              if (row.index < 1000) {
                // Level ranges
                return 40 * index + row.index;
              } else if (row.index < 2000) {
                // DoH masterbooks
                return 1000 + 8 * (row.index - 1000) + index;
              } else if (row.index >= 2010 && row.index <= 2012) {
                return [
                  // Quarrying, Mining, Logging, Harvesting
                  [2025, 2024, 2026, 2027], // Ilsabard
                  [2028, 2029, -1, 2031], // Sea of Stars
                  [2033, -1, 2034, -1]  // World Sundered
                ][row.index - 2010][index] || -1;
              } else if ([2006, 2007, 2008, 2009].includes(row.index)) {
                return -1;
              } else {
                // DoL folklores, only 4 DoLs tho
                return index < 4 ? (2000 + 4 * (row.index - 2000) + index) : -1;
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
    this.getSheet<any>(this.xiv, 'RecipeNotebookList', ['Recipe.CraftType', 'Recipe.SecretRecipeBook', 'Recipe.RecipeLevelTable', 'Recipe.ItemResult'], true, 1).subscribe((completeFetch) => {
      completeFetch.forEach(page => {
        // If it's an empty page or a collectable one, don't go further
        if (!page.Recipe[0] || page.Recipe[0]?.index <= 0 || (page.index >= 1256 && page.index < 1280)) {
          return;
        }
        page.Recipe.forEach((recipe) => {
          if (!recipe || recipe?.index <= 0) {
            return;
          }
          this.craftingLog[recipe.CraftType].push(recipe.index);
          this.addToCraftingLogPage(recipe, page.index);
        });
      });
      this.persistToJsonAsset('crafting-log', this.craftingLog);
      this.persistToJsonAsset('crafting-log-pages', this.craftingLogPages);
      this.craftingLogDone$.next();
    });
  }

  private extractGatheringLog(): void {
    this.getSheet<any>(this.xiv, 'GatheringNotebookList',
      ['GatheringItem.GatheringItemLevel.GatheringItemLevel', 'GatheringItem.Item#', 'GatheringItem.GatheringItemLevel.Stars', 'GatheringItem.IsHidden'],
      true, 2).subscribe(completeFetch => {
      completeFetch.forEach(page => {
        // If it's an empty page, don't go further
        if (!page.GatheringItem[0] || page.GatheringItem[0] === -1) {
          return;
        }
        page.GatheringItem.forEach(gatheringItem => {
          if (!gatheringItem) {
            return;
          }
          if (page.index >= 2200) {
            return;
          }
          const pageId = page.index;
          // 0 = MIN, 1 = MIN (quarrying), 2 = BTN, 3 = BTN (grass thing)
          let gathererIndex;
          if (page.index < 40) {
            gathererIndex = 0;
          } else if (page.index < 80) {
            gathererIndex = 1;
          } else if (page.index < 120) {
            gathererIndex = 2;
          } else if (page.index < 200) {
            gathererIndex = 3;
          } else {
            gathererIndex = (page.index - 2000) % 4;
          }
          this.addToGatheringLogPage(gatheringItem, pageId, gathererIndex);
        });
      });
      this.persistToJsonAsset('gathering-log-pages', this.gatheringLogPages);
      this.gatheringLogDone$.next();
    });
  }

  private extractFishingLog(): void {
    const diademTerritory = {
      'index': 901,
      'subIndex': 0,
      '__sheet': 'TerritoryType',
      'PlaceName': 1647,
      'Map': {
        'index': 584,
        'subIndex': 0,
        '__sheet': 'Map',
        'SizeFactor': 100
      }
    };

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

    const paramDone$ = new Subject<void>();
    const spotsDone$ = new Subject<void>();

    combineLatest([paramDone$, spotsDone$]).subscribe(() => {
      this.fishingLogDone$.next();
    });

    this.getSheet<any>(this.xiv, 'FishParameter',
      [
        'Item.Icon',
        'FishingSpot.TerritoryType.Map#', 'FishingSpot.TerritoryType.PlaceName#',
        'GatheringItemLevel.Stars', 'GatheringItemLevel.GatheringItemLevel', 'TimeRestricted', 'WeatherRestricted', 'FishingRecordType#', 'IsInLog', 'GatheringSubCategory.Item#'],
      false,
      2
    ).pipe(
      map(completeFetch => {
        const fishParameter = {};
        completeFetch
          .filter(fish => fish.Item.index > 0 && fish.FishingSpot.TerritoryType !== undefined)
          .forEach(fish => {
            if (fishes.indexOf(fish.Item.index) === -1) {
              fishes.push(fish.Item.index);
            }
            const entry: any = {
              id: fish.index,
              itemId: fish.Item.index,
              level: fish.GatheringItemLevel.GatheringItemLevel,
              icon: fish.Item.Icon,
              mapId: fish.FishingSpot.TerritoryType.Map,
              zoneId: fish.FishingSpot.TerritoryType.PlaceName,
              timed: fish.TimeRestricted ? 1 : 0,
              weathered: fish.WeatherRestricted ? 1 : 0,
              stars: fish.GatheringItemLevel.Stars || 0
            };
            if (fish.GatheringSubCategory) {
              entry.folklore = fish.GatheringSubCategory.Item;
            }
            if (fish.FishingRecordType) {
              entry.recordType = fish.FishingRecordType;
            }
            fishParameter[fish.Item.index] = entry;
          });
        return fishParameter;
      })
    ).subscribe(fishParameter => {
      this.persistToJsonAsset('fish-parameter', fishParameter);
      this.persistToJsonAsset('fishes', fishes);
      paramDone$.next();
    });

    this.getSheet<any>(this.xiv,
      'FishingSpot',
      [
        'Item.Icon',
        'TerritoryType.Map.SizeFactor', 'TerritoryType.PlaceName#',
        'PlaceName#', 'GatheringLevel#', 'X', 'Y', 'Z', 'FishingSpotCategory#', 'Icon'],
      true, 2
    ).subscribe((completeFetch) => {
      const spots = [];
      completeFetch
        .filter(spot => spot.Item[0] && spot.PlaceName && (spot.TerritoryType || spot.index >= 10000))
        .forEach(spot => {
          // Let's check if this is diadem
          if (!spot.TerritoryType && spot.index >= 10000) {
            spot.TerritoryType = diademTerritory;
          }
          const c = spot.TerritoryType.Map.SizeFactor / 100.0;

          spots.push({
            id: spot.index,
            mapId: spot.TerritoryType.Map.index,
            placeId: spot.TerritoryType.PlaceName,
            zoneId: spot.PlaceName,
            level: spot.GatheringLevel,
            category: spot.FishingSpotCategory,
            coords: spot.index >= 10000 ? diademFishingSpotCoords[spot.index] : {
              x: Math.floor(100 * (41.0 / c) * (spot.X / 2048.0) + 1) / 100 + 1,
              y: Math.floor(100 * (41.0 / c) * (spot.Z / 2048.0) + 1) / 100 + 1
            },
            fishes: spot.Item.filter(i => i.index > 0).map(i => i.index)
          });
          spot.Item
            .filter(item => item && item.index > 0)
            .forEach(fish => {
              const entry = {
                itemId: fish.index,
                level: spot.GatheringLevel,
                icon: this.getIconHD(fish.Icon),
                mapId: spot.TerritoryType.Map.index,
                placeId: spot.TerritoryType.PlaceName,
                zoneId: spot.PlaceName,
                category: spot.FishingSpotCategory,
                spot: {
                  id: spot.index,
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
      spotsDone$.next();
    });
  }

  private extractSpearfishingLog(): void {

    const spearFishingLog = [];

    this.getSheet<any>(this.xiv, 'SpearfishingNotebook',
      [
        'GatheringPointBase.Item.Item#', 'GatheringLevel.GatheringLevel',
        'TerritoryType.Map.SizeFactor', 'TerritoryType.PlaceName#',
        'PlaceName#', 'X', 'Y'
      ],
      true,
      2).subscribe(completeFetch => {
      completeFetch
        .filter(entry => entry.GatheringPointBase?.index > 0)
        .forEach(entry => {
          const entries = entry.GatheringPointBase.Item
            .filter(item => !!item)
            .map(item => {
              const c = entry.TerritoryType.Map.SizeFactor / 100.0;
              return {
                id: entry.GatheringPointBase.index,
                itemId: item.Item,
                level: entry.GatheringLevel.GatheringLevel,
                mapId: entry.TerritoryType.Map.index,
                placeId: entry.TerritoryType.PlaceName,
                zoneId: entry.PlaceName,
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

    this.getSheet(this.xiv, 'SpearfishingItem', ['Item#']).subscribe(
      (entries) => {
        entries.forEach(fish => {
          spearFishingFish.push(fish.Item);
        });
        this.persistToJsonAsset('spear-fishing-fish', spearFishingFish);
        this.spearFishingNodesDone$.next();
      });
  }

  private addToCraftingLogPage(entry: any, pageId: number) {
    this.craftingLogPages[entry.CraftType] = this.craftingLogPages[entry.CraftType] || [];
    let page = this.craftingLogPages[entry.CraftType].find(p => p.id === pageId);
    if (page === undefined) {
      this.craftingLogPages[entry.CraftType].push({
        id: pageId,
        masterbook: entry.SecretRecipeBook || null,
        startLevel: entry.RecipeLevelTable,
        recipes: []
      });
      page = this.craftingLogPages[entry.CraftType].find(p => p.id === pageId);
    }
    if (page.recipes.some(r => r.recipeId === entry.index)) {
      return;
    }
    page.recipes.push({
      recipeId: entry.index,
      itemId: entry.ItemResult,
      rlvl: entry.RecipeLevelTable
    });
  }

  private addToGatheringLogPage(entry: any, pageId: number, gathererIndex: number) {
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
      itemId: entry.Item,
      ilvl: entry.GatheringItemLevel.index,
      lvl: entry.GatheringItemLevel.GatheringItemLevel,
      stars: entry.GatheringItemLevel.Stars,
      hidden: entry.IsHidden ? 1 : 0
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
