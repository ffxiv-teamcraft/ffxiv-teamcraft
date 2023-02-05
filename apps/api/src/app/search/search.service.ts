import { Injectable } from '@nestjs/common';
import { combineLatest, from, Observable, of } from 'rxjs';
import {
  AchievementSearchResult,
  ActionSearchResult,
  FateSearchResult,
  FishingSpotSearchResult,
  GatheringNodeSearchResult,
  I18nName,
  InstanceSearchResult,
  LazyDataI18nKey,
  LeveSearchResult,
  MapSearchResult,
  MobSearchResult,
  NpcSearchResult,
  QuestSearchResult,
  Region,
  SearchResult,
  SearchType,
  StatusSearchResult
} from '@ffxiv-teamcraft/types';
import axios from 'axios';
import qs from 'qs';
import { LazyDataLoader } from '../lazy-data/lazy-data.loader';
import { map, switchMap } from 'rxjs/operators';
import type { XivapiSearchFilter, XivapiSearchOptions } from '@xivapi/angular-client';
import { SearchIndex } from './search-index';

@Injectable()
export class SearchService {

  constructor(private readonly lazyData: LazyDataLoader) {
  }

  public search(type: SearchType, query: string, filters: XivapiSearchFilter[], region: Region, lang: string, isCompatibleLocal: boolean, sort: [string, 'asc' | 'desc'] = ['', 'desc']): Observable<SearchResult[]> {
    let searchRequest$: Observable<any[]>;
    switch (type) {
      case SearchType.ANY:
        searchRequest$ = this.searchAny(query, filters, region, lang, isCompatibleLocal);
        break;
      case SearchType.ITEM:
        searchRequest$ = this.searchItem(query, filters, region, lang, false, isCompatibleLocal, sort);
        break;
      case SearchType.RECIPE:
        searchRequest$ = this.searchItem(query, filters, region, lang, true, isCompatibleLocal, sort);
        break;
      case SearchType.INSTANCE:
        searchRequest$ = this.searchInstance(query, filters, region);
        break;
      case SearchType.QUEST:
        searchRequest$ = this.searchQuest(query, filters, region);
        break;
      case SearchType.NPC:
        searchRequest$ = this.searchNpc(query, filters, region);
        break;
      case SearchType.LEVE:
        searchRequest$ = this.searchLeve(query, filters, region);
        break;
      case SearchType.MONSTER:
        searchRequest$ = this.searchMob(query, filters, region);
        break;
      case SearchType.FATE:
        searchRequest$ = this.searchFate(query, filters, region);
        break;
      case SearchType.MAP:
        searchRequest$ = this.searchMap(query, filters, region);
        break;
      case SearchType.ACTION:
        searchRequest$ = this.searchAction(query, filters, region);
        break;
      case SearchType.STATUS:
        searchRequest$ = this.searchStatus(query, filters, region);
        break;
      case SearchType.TRAIT:
        searchRequest$ = this.searchTrait(query, filters, region);
        break;
      case SearchType.ACHIEVEMENT:
        searchRequest$ = this.searchAchievement(query, filters, region);
        break;
      case SearchType.FISHING_SPOT:
        searchRequest$ = this.searchFishingSpot(query, lang);
        break;
      case SearchType.GATHERING_NODE:
        searchRequest$ = this.searchGatheringNode(query, lang);
        break;
      default:
        searchRequest$ = this.searchItem(query, filters, region, lang, false, isCompatibleLocal, sort);
        break;
    }
    if (type === SearchType.ANY) {
      return searchRequest$;
    } else {
      return searchRequest$.pipe(
        map(results => {
          return results.map(row => {
            row.type = type;
            return row;
          });
        })
      );
    }
  }

  searchAny(query: string, filters: XivapiSearchFilter[], region: Region, lang: string, isCompatibleLocal: boolean): Observable<any[]> {
    // Filter HQ and Collectable Symbols from search
    query = query.replace(/[\ue03a-\ue03d]/g, '').toLowerCase();
    const otherSearch$ = this.xivapiSearch(region, {
      indexes: [
        SearchIndex.INSTANCECONTENT,
        SearchIndex.QUEST,
        SearchIndex.ACTION,
        SearchIndex.CRAFT_ACTION,
        SearchIndex.TRAIT,
        SearchIndex.STATUS,
        SearchIndex.ACHIEVEMENT,
        SearchIndex.LEVE,
        SearchIndex.ENPCRESIDENT,
        SearchIndex.BNPCNAME,
        SearchIndex.FATE,
        SearchIndex.PLACENAME
      ],
      columns: ['ID', 'Name_*', 'Banner', 'Icon', 'ContentFinderCondition.ClassJobLevelRequired',
        'ClassJobLevel', 'ClassJob', 'ClassJobCategory', 'Level', 'Description_*', 'IconIssuer',
        'Title_*', 'IconMap', '_'],
      // I know, it looks like it's the same, but it isn't
      string: query,
      filters
    }).pipe(
      switchMap(res => {
        if (res.length === 0) {
          return of([]);
        }
        return combineLatest(res.Results.map(row => {
          switch (row._) {
            case SearchIndex.INSTANCECONTENT:
              return of(this.mapInstance(row));
            case SearchIndex.QUEST:
              return of(this.mapQuest(row));
            case SearchIndex.ACTION:
            case SearchIndex.CRAFT_ACTION:
              return of(this.mapAction(row));
            case SearchIndex.TRAIT:
              return of(this.mapTrait(row));
            case SearchIndex.STATUS:
              return of(this.mapStatus(row));
            case SearchIndex.ACHIEVEMENT:
              return of(this.mapAchievement(row));
            case SearchIndex.LEVE:
              return of(this.mapLeve(row));
            case SearchIndex.ENPCRESIDENT:
              return of(this.mapNpc(row));
            case SearchIndex.BNPCNAME:
              return this.mapMob(row);
            case SearchIndex.FATE:
              return of(this.mapFate(row));
            case SearchIndex.PLACENAME:
              return of(this.mapMap(row));
          }
          console.warn('No type matching for res type', row._);
        })).pipe(
          map((mapped: SearchResult[]) => mapped.filter((r: SearchResult) => !!r && !!r.type))
        );
      })
    );
    return combineLatest([
      this.searchItem(query, filters, region, lang, false, isCompatibleLocal).pipe(map(res => res.map(row => {
        row.type = SearchType.ITEM;
        return row;
      }))),
      otherSearch$,
      this.searchFishingSpot(query, lang).pipe(map(res => res.map(row => {
        row.type = SearchType.FISHING_SPOT;
        return row;
      })))
    ]).pipe(
      map(results => results.flat())
    );
  }


  private searchItem(query: string, filters: XivapiSearchFilter[], region: Region, lang: string, onlyCraftable: boolean, isCompatibleLocal: boolean, sort: [string, 'asc' | 'desc'] = ['', 'desc']): Observable<SearchResult[]> {
    const xivapiFilters: XivapiSearchFilter[] = filters;

    if (onlyCraftable && !isCompatibleLocal) {
      xivapiFilters.push({
        column: 'Recipes.ClassJobID',
        operator: '>',
        value: 1
      });
    }

    const searchOptions: any = {
      indexes: ['item'],
      string: query,
      filters: xivapiFilters,
      exclude_dated: 1,
      columns: ['ID', 'Name_*', 'Icon', 'Recipes', 'GameContentLinks'],
      language: lang
    };

    if (sort[0]) {
      searchOptions.sort_field = sort[0];
    }
    searchOptions.sort_order = sort[1];

    let xivapiResults$: Observable<any[]>;

    if (isCompatibleLocal) {
      xivapiResults$ = this.mapToItemIds(query, lang as 'ko' | 'zh').pipe(
        switchMap(ids => {
          return this.xivapiList(
            region,
            'Item',
            ids,
            ['ID', 'Name_*', 'Icon', 'Recipes', 'GameContentLinks']
          ).pipe(
            map(items => {
              return items.Results.filter(item => {
                if (!onlyCraftable) return true;
                const matchesRecipeFilter = item.Recipes && item.Recipes.length > 0;
                return matchesRecipeFilter && xivapiFilters.reduce((matches, f) => {
                  switch (f.operator) {
                    case '>=':
                      return matches && item[f.column] >= f.value;
                    case '<=':
                      return matches && item[f.column] <= f.value;
                    case '=':
                      return matches && item[f.column] === f.value;
                    case '<':
                      return matches && item[f.column] < f.value;
                    case '>':
                      return matches && item[f.column] > f.value;
                  }
                }, true);
              });
            })
          );
        })
      );
    } else {
      xivapiResults$ = this.xivapiSearch(region, searchOptions).pipe(
        map(res => res.Results)
      );
    }

    const MJIResults$ = query?.length > 3 ? combineLatest([
      this.lazyData.get('islandBuildings'),
      this.lazyData.get('islandLandmarks')
    ]).pipe(
      map(([buildings, landmarks]) => {
        return [
          ...Object.entries(buildings)
            .filter(([, building]) => {
              return building[lang]?.toLowerCase().includes(query.toLowerCase());
            })
            .map(([key, building]) => {
              return <SearchResult>{
                id: +key,
                itemId: +key,
                icon: `${this.getBaseUrl(region)}${building.icon}`,
                contentType: 'islandBuildings',
                amount: 1,
                recipe: {
                  recipeId: `mjibuilding-${key}`,
                  itemId: +key,
                  collectible: false,
                  job: -10,
                  stars: 0,
                  lvl: 1,
                  icon: `${this.getBaseUrl(region)}${building.icon}`
                }
              };
            }),
          ...Object.entries(landmarks)
            .filter(([, landmark]) => {
              return landmark[lang]?.toLowerCase().includes(query.toLowerCase());
            })
            .map(([key, landmark]) => {
              return <SearchResult>{
                id: +key,
                itemId: +key,
                icon: `${this.getBaseUrl(region)}${(landmark as any).icon}`,
                contentType: 'islandLandmarks',
                amount: 1,
                recipe: {
                  recipeId: `mjilandmark-${key}`,
                  itemId: +key,
                  collectible: false,
                  job: -10,
                  stars: 0,
                  lvl: 1,
                  icon: `${this.getBaseUrl(region)}${(landmark as any).icon}`
                }
              };
            })
        ];
      })
    ) : of([]);

    const baseUrl = this.getBaseUrl(region);
    const baseResults$ = xivapiResults$.pipe(
      map(results => {
        if (onlyCraftable) {
          return results.filter(row => {
            return (row.Recipes && row.Recipes.length > 0)
              || (row.GameContentLinks && row.GameContentLinks.CompanyCraftSequence && row.GameContentLinks.CompanyCraftSequence.ResultItem);
          });
        }
        return results;
      }),
      switchMap(xivapiSearchResults => {
        return this.lazyData.get('recipesPerItem').pipe(
          map(lazyRecipes => {
            const results: SearchResult[] = [];
            xivapiSearchResults.forEach(item => {
              const recipes = lazyRecipes[item.ID] || [];
              if (recipes.length > 0) {
                const craftedByFilter = filters.find(f => f.column === 'Recipes.ClassJobID');
                recipes
                  .filter(recipe => {
                    return !craftedByFilter || +craftedByFilter.value === recipe.job;
                  })
                  .forEach(recipe => {
                    results.push({
                      itemId: item.ID,
                      icon: `${baseUrl}${item.Icon}`,
                      amount: 1,
                      contentType: 'items',
                      recipe: {
                        recipeId: recipe.id.toString(),
                        itemId: item.ID,
                        collectible: item.GameContentLinks && item.GameContentLinks.MasterpieceSupplyDuty,
                        job: recipe.job,
                        stars: recipe.stars,
                        lvl: recipe.lvl
                      }
                    });
                  });
              } else {
                results.push({
                  itemId: item.ID,
                  contentType: 'items',
                  icon: `${baseUrl}${item.Icon}`,
                  amount: 1
                });
              }
            });
            return results;
          })
        );
      })
    );

    return combineLatest([baseResults$, MJIResults$])
      .pipe(
        map(([a, b]) => {
          return [...a, ...b];
        })
      );
  }

  private mapToItemIds(terms: string, lang: 'ko' | 'zh'): Observable<number[]> {
    return this.lazyData.get(lang === 'ko' ? 'koItems' : 'zhItems').pipe(
      map((data) => {
        return Object.keys(data)
          .filter(key => {
            return data[key][lang].indexOf(terms) > -1 && !/(\D+)/.test(key);
          })
          .map(key => {
            return +key;
          })
          .sort((a, b) => {
            return this.similar(data[b][lang], terms) - this.similar(data[a][lang], terms);
          })
          .slice(0, 100);
      })
    );
  }

  private similar(a: string, b: string): number {
    let equivalency = 0;
    const minLength = (a.length > b.length) ? b.length : a.length;
    const maxLength = (a.length < b.length) ? b.length : a.length;
    for (let i = 0; i < minLength; i++) {
      if (a[i]?.toLowerCase() === b[i]?.toLowerCase()) {
        equivalency++;
      }
    }

    const weight = equivalency / maxLength;
    return weight * 100;
  }

  searchInstance(query: string, filters: XivapiSearchFilter[], region: Region): Observable<InstanceSearchResult[]> {
    return this.xivapiSearch(region, {
      indexes: [SearchIndex.INSTANCECONTENT],
      columns: ['ID', 'Banner', 'Icon', 'ContentFinderCondition.ClassJobLevelRequired'],
      string: query,
      filters: filters
    }).pipe(
      map(res => {
        return res.Results.map(instance => {
          return this.mapInstance(instance);
        });
      })
    );
  }

  searchQuest(query: string, filters: XivapiSearchFilter[], region: Region): Observable<QuestSearchResult[]> {
    return this.xivapiSearch(region, {
      indexes: [SearchIndex.QUEST],
      columns: ['ID', 'Banner', 'Icon'],
      string: query,
      filters: filters
    }).pipe(
      map(res => {
        return res.Results.map(quest => {
          return this.mapQuest(quest);
        });
      })
    );
  }

  searchAction(query: string, filters: XivapiSearchFilter[], region: Region): Observable<ActionSearchResult[]> {
    return this.xivapiSearch(region, {
      indexes: [SearchIndex.ACTION, <SearchIndex>'craftaction'],
      columns: ['ID', 'Icon', 'ClassJobLevel', 'ClassJob', 'ClassJobCategory'],
      string: query,
      filters: filters
    }).pipe(
      map(res => {
        return res.Results.map(action => {
          return this.mapAction(action);
        });
      })
    );
  }

  searchTrait(query: string, filters: XivapiSearchFilter[], region: Region): Observable<ActionSearchResult[]> {
    return this.xivapiSearch(region, {
      indexes: [<SearchIndex>'trait'],
      columns: ['ID', 'Icon', 'Level', 'ClassJob', 'ClassJobCategory'],
      string: query,
      filters: filters
    }).pipe(
      map(res => {
        return res.Results.map(trait => {
          return this.mapTrait(trait);
        });
      })
    );
  }

  searchStatus(query: string, filters: XivapiSearchFilter[], region: Region): Observable<StatusSearchResult[]> {
    return this.xivapiSearch(region, {
      indexes: [SearchIndex.STATUS],
      columns: ['ID', 'Icon', 'Name_*', 'Description_*'],
      string: query,
      filters: filters
    }).pipe(
      map(res => {
        return res.Results.map(status => {
          return this.mapStatus(status);
        });
      })
    );
  }

  searchAchievement(query: string, filters: XivapiSearchFilter[], region: Region): Observable<AchievementSearchResult[]> {
    return this.xivapiSearch(region, {
      indexes: [SearchIndex.ACHIEVEMENT],
      columns: ['ID', 'Icon', 'Name_*', 'Description_*'],
      string: query,
      filters: filters
    }).pipe(
      map(res => {
        return res.Results.map(achievement => {
          return this.mapAchievement(achievement);
        });
      })
    );
  }

  searchLeve(query: string, filters: XivapiSearchFilter[], region: Region): Observable<LeveSearchResult[]> {
    return this.xivapiSearch(region, {
      indexes: [SearchIndex.LEVE],
      columns: ['ID', 'Banner', 'Icon', 'ClassJobCategory', 'IconIssuer', 'ClassJobLevel'],
      string: query,
      filters: filters
    }).pipe(
      map(res => {
        return res.Results.map(leve => {
          return this.mapLeve(leve);
        });
      })
    );
  }

  searchNpc(query: string, filters: XivapiSearchFilter[], region: Region): Observable<NpcSearchResult[]> {
    return this.xivapiSearch(region, {
      indexes: [SearchIndex.ENPCRESIDENT],
      columns: ['ID', 'Title_*', 'Icon'],
      string: query,
      filters: filters
    }).pipe(
      map(res => {
        return res.Results.map(npc => {
          return this.mapNpc(npc);
        });
      })
    );
  }

  searchMob(query: string, filters: XivapiSearchFilter[], region: Region): Observable<MobSearchResult[]> {
    return this.xivapiSearch(region, {
      indexes: [SearchIndex.BNPCNAME],
      columns: ['ID', 'Icon'],
      string: query,
      filters: filters
    }).pipe(
      switchMap(res => {
        if (res.length === 0) {
          return of([]);
        }
        return combineLatest(res.Results.map(mob => {
          return this.mapMob(mob);
        })) as Observable<MobSearchResult[]>;
      })
    );
  }

  searchFate(query: string, filters: XivapiSearchFilter[], region: Region): Observable<FateSearchResult[]> {
    return this.xivapiSearch(region, {
      indexes: [SearchIndex.FATE],
      columns: ['ID', 'IconMap', 'ClassJobLevel'],
      string: query,
      filters: filters
    }).pipe(
      map(res => {
        return res.Results.map(fate => {
          return this.mapFate(fate);
        });
      })
    );
  }

  searchFishingSpot(query: string, lang: string): Observable<FishingSpotSearchResult[]> {
    return this.lazyData.get('fishingSpots').pipe(
      switchMap(fishingSpots => {
        if (fishingSpots.length === 0) {
          return of([]);
        }
        return combineLatest(
          fishingSpots.map(spot => {
            return combineLatest([
              this.getNameObservable(lang, 'places', spot.zoneId),
              this.getMapName(lang, spot.mapId)
            ]).pipe(
              map(([placeName, mapName]) => {
                return { spot, matches: placeName.toLowerCase().includes(query.toLowerCase()) || mapName.toLowerCase().includes(query.toLowerCase()) };
              })
            );
          })
        ).pipe(
          map(result => {
            return result.filter(row => row.matches)
              .map(({ spot }) => {
                return {
                  id: spot.id,
                  spot: spot
                };
              });
          })
        );
      })
    );
  }

  searchGatheringNode(query: string, lang: string): Observable<GatheringNodeSearchResult[]> {
    return this.lazyData.get('nodes').pipe(
      map(nodes => Object.entries(nodes).map(([key, node]) => ({ id: +key, ...node }))),
      switchMap(nodes => {
        if (nodes.length === 0) {
          return of([]);
        }
        return combineLatest(
          nodes.map(node => {
            return combineLatest([
              this.getNameObservable(lang, 'places', node.zoneid),
              this.getMapName(lang, node.map)
            ]).pipe(
              map(([placeName, mapName]) => {
                return { node, matches: placeName.toLowerCase().includes(query.toLowerCase()) || mapName.toLowerCase().includes(query.toLowerCase()) };
              })
            );
          })
        ).pipe(
          map(result => {
            return result.filter(row => row.matches)
              .map(({ node }) => {
                return {
                  id: node.id,
                  node
                };
              });
          })
        );
      })
    );
  }

  searchMap(query: string, filters: XivapiSearchFilter[], region: Region): Observable<MapSearchResult[]> {
    return this.xivapiSearch(region, {
      indexes: [SearchIndex.PLACENAME],
      columns: ['ID', 'Name_*'],
      string: query,
      filters
    }).pipe(
      map(res => {
        return res.Results.map(place => {
          return this.mapMap(place);
        }).filter(r => r !== null);
      })
    );
  }

  private xivapiSearch<T = any>(region: Region, options: XivapiSearchOptions): Observable<T> {
    const filters = options.filters.reduce((chain, filter) => {
      const value: string = filter.value instanceof Array ? filter.value.join(';') : (filter.value || '').toString();
      return `${chain}${filter.column}${filter.operator}${value},`;
    }, '').slice(0, -1);
    // Uncomment to debug request url for xivapi in the event of a 500 error.
    // axios.interceptors.request.use(config => {
    //   console.log(config.params.filters);
    //   console.log(axios.getUri(config));
    //   return config;
    // });
    return from(axios.get<T>(`${this.getBaseUrl(region)}/search`, {
      params: { ...options, filters },
      paramsSerializer: {
        serialize: params => qs.stringify(params, { arrayFormat: 'comma' })
      }
    }).then(res => res.data as T));
  }

  private xivapiList<T = any>(region: Region, endpoint: string, ids: number[], columns: string[]): Observable<T> {
    return from(axios.get<T>(`${this.getBaseUrl(region)}/${endpoint}`, {
      params: { ids, columns },
      paramsSerializer: {
        serialize: params => qs.stringify(params, { arrayFormat: 'comma' })
      }
    }).then(res => res.data));
  }

  private getBaseUrl(region: Region) {
    if (region === Region.China) {
      return 'https://cafemaker.wakingsands.com';
    }
    return 'https://xivapi.com';
  }

  private mapAchievement(achievement: any): StatusSearchResult {
    return {
      id: achievement.ID,
      icon: achievement.Icon,
      data: achievement,
      type: SearchType.ACHIEVEMENT
    };
  }

  private mapFate(fate: any): FateSearchResult {
    return {
      id: fate.ID,
      icon: fate.IconMap,
      level: fate.ClassJobLevel,
      type: SearchType.FATE
    };
  }

  private mapMob(mob: any): Observable<MobSearchResult> {
    return this.lazyData.get('monsters').pipe(
      map(monsters => monsters[mob.ID]),
      map(monster => {
        return {
          id: mob.ID,
          icon: mob.Icon,
          zoneid: monster && monster.positions[0] ? monster.positions[0].zoneid : null,
          type: SearchType.MONSTER
        };
      })
    );
  }

  private mapNpc(npc: any): NpcSearchResult {
    return {
      id: npc.ID,
      icon: npc.Icon,
      title: this.xivapiToI18n(npc, 'Title'),
      type: SearchType.NPC
    };
  }

  private mapStatus(status: any): StatusSearchResult {
    return {
      id: status.ID,
      icon: status.Icon,
      data: status,
      type: SearchType.STATUS
    };
  }

  private mapTrait(trait: any): ActionSearchResult {
    return {
      id: trait.ID,
      icon: trait.Icon,
      job: trait.ClassJob || trait.ClassJobCategory,
      level: trait.Level,
      type: SearchType.TRAIT
    };
  }

  private mapAction(action: any): ActionSearchResult {
    return {
      id: action.ID,
      icon: action.Icon,
      job: action.ClassJob || action.ClassJobCategory,
      level: action.Level,
      type: SearchType.ACTION
    };
  }

  private mapQuest(quest: any): QuestSearchResult {
    return {
      id: quest.ID,
      icon: quest.Icon,
      banner: quest.Banner,
      type: SearchType.QUEST
    };
  }

  private mapInstance(instance: any): InstanceSearchResult {
    return {
      id: instance.ID,
      icon: instance.Icon,
      banner: instance.Banner,
      level: instance.ContentFinderCondition.ClassJobLevelRequired,
      type: SearchType.INSTANCE
    };
  }

  private mapLeve(leve: any): LeveSearchResult {
    return {
      id: leve.ID,
      icon: leve.Icon,
      level: leve.ClassJobLevel,
      banner: leve.IconIssuer,
      job: this.xivapiToI18n(leve.ClassJobCategory)
    };
  }

  private mapMap(place: any): Observable<MapSearchResult> {
    return this.lazyData.get('mapEntries').pipe(
      map(mapIds => {
        const entry = mapIds.find(m => m.zone === place.ID);
        if (entry === undefined) {
          return null;
        }
        return {
          id: entry.id,
          zoneid: place.ID,
          type: SearchType.MAP
        };
      })
    );
  }

  public xivapiToI18n(value: any, fieldName = 'Name'): I18nName {
    return {
      en: value[`${fieldName}_en`],
      fr: value[`${fieldName}_fr`],
      de: value[`${fieldName}_de`],
      ja: value[`${fieldName}_ja`],
      ko: value[`${fieldName}_ko`],
      zh: value[`${fieldName}_chs`]
    };
  }

  public getNameObservable(lang: string, entry: LazyDataI18nKey, id: number): Observable<string> {
    return this.lazyData.get(entry).pipe(
      map(record => {
        const entry = record[id];
        if (!entry) {
          return 'missing name';
        }
        return entry[lang] || (entry as any).en || 'no name';
      })
    );
  }

  public getMapName(lang: string, id: number): Observable<string> {
    return this.lazyData.get('mapEntries').pipe(
      switchMap(record => {
        const mapEntry = record.find(e => e.id === id);
        return this.getNameObservable(lang, 'places', mapEntry?.zone || 1);
      })
    );
  }
}
