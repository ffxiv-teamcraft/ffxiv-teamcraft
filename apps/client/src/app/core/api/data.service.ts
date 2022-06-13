import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { combineLatest, Observable, of } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { Recipe } from '../../model/search/recipe';
import { ItemData } from '../../model/garland-tools/item-data';
import { NgSerializerService } from '@kaiu/ng-serializer';
import { SearchFilter } from '../../model/search/search-filter.interface';
import { map, switchMap, tap } from 'rxjs/operators';
import { SearchResult } from '../../model/search/search-result';
import { InstanceData } from '../../model/garland-tools/instance-data';
import { QuestData } from '../../model/garland-tools/quest-data';
import { NpcData } from '../../model/garland-tools/npc-data';
import { LeveData } from '../../model/garland-tools/leve-data';
import { MobData } from '../../model/garland-tools/mob-data';
import { FateData } from '../../model/garland-tools/fate-data';
import { SearchAlgo, SearchIndex, XivapiEndpoint, XivapiOptions, XivapiSearchFilter, XivapiSearchOptions, XivapiService } from '@xivapi/angular-client';
import { SearchType } from '../../pages/search/search-type';
import { InstanceSearchResult } from '../../model/search/instance-search-result';
import { QuestSearchResult } from '../../model/search/quest-search-result';
import { ActionSearchResult } from '../../model/search/action-search-result';
import { StatusSearchResult } from '../../model/search/status-search-result';
import { LeveSearchResult } from '../../model/search/leve-search-result';
import { NpcSearchResult } from '../../model/search/npc-search-result';
import { MobSearchResult } from '../../model/search/mob-search-result';
import { FateSearchResult } from '../../model/search/fate-search-result';
import { MapSearchResult } from '../../model/search/map-search-result';
import { mapIds } from '../data/sources/map-ids';
import { requestsWithDelay } from '../rxjs/requests-with-delay';
import { FishingSpotSearchResult } from '../../model/search/fishing-spot-search-result';
import { I18nToolsService } from '../tools/i18n-tools.service';
import { SettingsService } from '../../modules/settings/settings.service';
import { Region } from '../../modules/settings/region.enum';
import { Language } from '../data/language';
import { LazyDataFacade } from '../../lazy-data/+state/lazy-data.facade';
import { withLazyData } from '../rxjs/with-lazy-data';
import { safeCombineLatest } from '../rxjs/safe-combine-latest';
import { GatheringNodeSearchResult } from '../../model/search/gathering-node-search-result';

@Injectable()
export class DataService {

  public garlandtoolsVersions = {
    item: 3,
    instance: 2,
    quest: 2,
    npc: 2,
    leve: 3,
    mob: 2,
    fate: 2
  };

  public searchLang = this.translate.currentLang;

  private garlandUrl = 'https://www.garlandtools.org/db/doc';

  private garlandApiUrl = 'https://www.garlandtools.org/api';

  constructor(private http: HttpClient,
              private i18n: I18nToolsService,
              private settings: SettingsService,
              private xivapi: XivapiService,
              private serializer: NgSerializerService,
              private lazyData: LazyDataFacade,
              private translate: TranslateService) {
  }

  private get isCompatible() {
    return this.searchLang === 'ko' || this.searchLang === 'zh' && this.settings.region !== Region.China;
  }

  private get baseUrl() {
    if (this.settings.region === Region.China) {
      return 'https://cafemaker.wakingsands.com';
    }

    return 'https://xivapi.com';
  }

  public setSearchLang(lang: Language): void {
    this.searchLang = lang;
  }

  public xivapiSearch(options: XivapiSearchOptions, forcedLang?: string) {
    const lang = forcedLang || this.getSearchLang();

    const searchOptions: XivapiSearchOptions = Object.assign({}, options, {
      language: lang
    });

    if (this.settings.region === Region.China) {
      searchOptions.baseUrl = this.baseUrl;
    }

    if (!['chs', 'zh'].includes(lang)) {
      searchOptions.string_algo = SearchAlgo.WILDCARD_PLUS;
    }

    return this.xivapi.search(searchOptions);
  }

  /**
   * Gets an item based on its id.
   * @param {number} id
   * @returns {Observable<ItemData>}
   */
  public getItem(id: number): Observable<ItemData> {
    return this.getGarlandData(`/item/en/${this.garlandtoolsVersions.item}/${id}`)
      .pipe(map(item => this.serializer.deserialize<ItemData>(item, ItemData)));
  }

  /**
   * Gets an instance based on its id.
   * @param {number} id
   * @returns {Observable<InstanceData>}
   */
  public getInstance(id: number): Observable<InstanceData> {
    return this.getGarlandData(`/instance/en/${this.garlandtoolsVersions.instance}/${id}`)
      .pipe(map(item => this.serializer.deserialize<InstanceData>(item, InstanceData)));
  }

  /**
   * Gets an instance based on its id.
   * @param {number} id
   * @returns {Observable<NpcData>}
   */
  public getNpc(id: number): Observable<NpcData> {
    return this.getGarlandData(`/npc/en/${this.garlandtoolsVersions.npc}/${id}`)
      .pipe(map(item => this.serializer.deserialize<NpcData>(item, NpcData)));
  }

  /**
   * Gets a quest based on its id.
   * @param {number} id
   * @returns {Observable<QuestData>}
   */
  public getQuest(id: number): Observable<QuestData> {
    return this.getGarlandData(`/quest/en/${this.garlandtoolsVersions.quest}/${id}`)
      .pipe(map(item => this.serializer.deserialize<QuestData>(item, QuestData)));
  }

  /**
   * Gets a quest based on its id.
   * @param {number} id
   * @returns {Observable<LeveData>}
   */
  public getLeve(id: number): Observable<LeveData> {
    return this.getGarlandData(`/leve/en/${this.garlandtoolsVersions.leve}/${id}`)
      .pipe(map(item => this.serializer.deserialize<LeveData>(item, LeveData)));
  }

  /**
   * Gets a mob based on its id.
   * @param {number} id
   * @returns {Observable<MobData>}
   */
  public getMob(id: string): Observable<MobData> {
    return this.getGarlandData(`/mob/en/${this.garlandtoolsVersions.mob}/${id}`)
      .pipe(map(item => this.serializer.deserialize<MobData>(item, MobData)));
  }

  /**
   * Gets a mob based on its id.
   * @param {number} id
   * @returns {Observable<MobData>}
   */
  public getFate(id: number): Observable<FateData> {
    return this.getGarlandData(`/fate/en/${this.garlandtoolsVersions.fate}/${id}`)
      .pipe(map(item => this.serializer.deserialize<FateData>(item, FateData)));
  }

  /**
   * Fires a search request to the search api in order to get results based on filters.
   * @param {string} query
   * @param {SearchFilter[]} filters
   * @param onlyCraftable
   * @param sort
   * @param ignoreLanguageSetting
   * @returns {Observable<Recipe[]>}
   */
  public searchItem(query: string, filters: SearchFilter[], onlyCraftable: boolean, sort: [string, 'asc' | 'desc'] = [null, 'desc'], ignoreLanguageSetting = false): Observable<SearchResult[]> {
    const searchLang = ignoreLanguageSetting ? this.translate.currentLang : this.searchLang;
    const isCompatibleLocal = searchLang === 'ko' || searchLang === 'zh' && this.settings.region !== Region.China;
    // Filter HQ and Collectable Symbols from search
    query = query.replace(/[\ue03a-\ue03d]/g, '').toLowerCase();

    const xivapiFilters: XivapiSearchFilter[] = [].concat.apply([], filters
      .filter(f => {
        return f.value !== null;
      })
      .map(f => {
        if (f.minMax) {
          if (f.value.exclude) {
            return [
              {
                column: f.name,
                operator: '!!'
              }
            ];
          } else {
            return [
              {
                column: f.name,
                operator: '>=',
                value: f.value.min
              },
              {
                column: f.name,
                operator: '<=',
                value: f.value.max
              }
            ];
          }
        } else if (f.array) {
          return [
            {
              column: f.name,
              operator: '|=',
              value: f.value
            }
          ];
        }
        return [{
          column: f.name,
          operator: '=',
          value: f.value
        }];
      }));

    if (onlyCraftable && !isCompatibleLocal) {
      xivapiFilters.push({
        column: 'Recipes.ClassJobID',
        operator: '>',
        value: 1
      });
    }

    const searchOptions: XivapiSearchOptions = {
      indexes: [SearchIndex.ITEM],
      string: query,
      filters: xivapiFilters,
      exclude_dated: 1,
      columns: ['ID', 'Name_*', 'Icon', 'Recipes', 'GameContentLinks']
    };

    if (sort[0]) {
      searchOptions.sort_field = sort[0];
    }
    searchOptions.sort_order = sort[1];

    let results$ = this.xivapiSearch(searchOptions, ignoreLanguageSetting ? this.translate.currentLang : null).pipe(
      map(response => {
        return response.Results;
      })
    );

    if (isCompatibleLocal) {
      results$ = this.mapToItemIds(query, searchLang as 'ko' | 'zh').pipe(
        switchMap(ids => {
          return this.xivapi.getList(
            XivapiEndpoint.Item,
            {
              ids: ids,
              columns: ['ID', 'Name_*', 'Icon', 'Recipes', 'GameContentLinks']
            }
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
    }

    const baseUrl = this.baseUrl;
    return results$.pipe(
      map(results => {
        if (onlyCraftable) {
          return results.filter(row => {
            return (row.Recipes && row.Recipes.length > 0)
              || (row.GameContentLinks && row.GameContentLinks.CompanyCraftSequence && row.GameContentLinks.CompanyCraftSequence.ResultItem);
          });
        }
        return results;
      }),
      withLazyData(this.lazyData, 'recipes'),
      map(([xivapiSearchResults, lazyRecipes]) => {
        const results: SearchResult[] = [];
        xivapiSearchResults.forEach(item => {
          const recipes = lazyRecipes.filter(recipe => recipe.result === item.ID);
          if (recipes.length > 0) {
            const craftedByFilter = filters.find(f => f.name === 'Recipes.ClassJobID');
            recipes
              .filter(recipe => {
                return !craftedByFilter || craftedByFilter.value === recipe.job;
              })
              .forEach(recipe => {
                results.push({
                  itemId: item.ID,
                  icon: `${baseUrl}${item.Icon}`,
                  amount: 1,
                  recipe: {
                    recipeId: recipe.id.toString(),
                    itemId: item.ID,
                    collectible: item.GameContentLinks && item.GameContentLinks.MasterpieceSupplyDuty,
                    job: recipe.job,
                    stars: recipe.stars,
                    lvl: recipe.lvl,
                    icon: `${baseUrl}${item.Icon}`
                  }
                });
              });
          } else {
            results.push({
              itemId: item.ID,
              icon: `${baseUrl}${item.Icon}`,
              amount: 1
            });
          }
        });
        return results;
      })
    );
  }

  public search(query: string, type: SearchType, filters: SearchFilter[], sort: [string, 'asc' | 'desc'] = [null, 'desc']): Observable<SearchResult[]> {
    let searchRequest$: Observable<any[]>;
    switch (type) {
      case SearchType.ANY:
        searchRequest$ = this.searchAny(query, filters);
        break;
      case SearchType.ITEM:
        searchRequest$ = this.searchItem(query, filters, false, sort);
        break;
      case SearchType.RECIPE:
        searchRequest$ = this.searchItem(query, filters, true, sort);
        break;
      case SearchType.INSTANCE:
        searchRequest$ = this.searchInstance(query, filters);
        break;
      case SearchType.QUEST:
        searchRequest$ = this.searchQuest(query, filters);
        break;
      case SearchType.NPC:
        searchRequest$ = this.searchNpc(query, filters);
        break;
      case SearchType.LEVE:
        searchRequest$ = this.searchLeve(query, filters);
        break;
      case SearchType.MONSTER:
        searchRequest$ = this.searchMob(query, filters);
        break;
      case SearchType.LORE:
        searchRequest$ = this.searchLore(query, filters);
        break;
      case SearchType.FATE:
        searchRequest$ = this.searchFate(query, filters);
        break;
      case SearchType.MAP:
        searchRequest$ = this.searchMap(query, filters);
        break;
      case SearchType.ACTION:
        searchRequest$ = this.searchAction(query, filters);
        break;
      case SearchType.STATUS:
        searchRequest$ = this.searchStatus(query, filters);
        break;
      case SearchType.TRAIT:
        searchRequest$ = this.searchTrait(query, filters);
        break;
      case SearchType.ACHIEVEMENT:
        searchRequest$ = this.searchAchievement(query, filters);
        break;
      case SearchType.FISHING_SPOT:
        searchRequest$ = this.searchFishingSpot(query, filters);
        break;
      case SearchType.GATHERING_NODE:
        searchRequest$ = this.searchGatheringNode(query, filters);
        break;
      default:
        searchRequest$ = this.searchItem(query, filters, false, sort);
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

  /**
   * Searches for gathering items based on a given name.
   * Will return an observable of empty array if name is shorter than 2 characters.
   *
   * @param {string} name
   * @returns {Observable<number[]>}
   */
  public searchGathering(name: string): Observable<number[]> {
    let lang = this.searchLang;
    const isKoOrZh = ['ko', 'zh'].indexOf(this.searchLang.toLowerCase()) > -1;
    if (isKoOrZh) {
      if (name.length > 0) {
        lang = 'en';
      } else {
        return of([]);
      }
    } else if (name.length < 2 && (this.searchLang !== 'ja' && name.length === 0)) {
      return of([]);
    }

    let params = new HttpParams()
      .set('gatherable', '1')
      .set('type', 'item')
      .set('lang', lang);

    // If the lang is korean, handle it properly to map to item ids.
    if (isKoOrZh) {
      return this.mapToItemIds(name, this.searchLang as 'ko' | 'zh').pipe(
        switchMap(ids => {
          params = ids.length > 0 ? params.set('ids', ids.join(',')) : params.set('text', name);
          return this.getGarlandSearch(params).pipe(
            map(results => {
              return (results || []).map(item => item.obj.i);
            })
          );
        })
      );
    } else {
      params = params.set('text', name);
    }

    return this.getGarlandSearch(params).pipe(
      map(results => {
        return (results || []).map(item => item.obj.i);
      })
    );
  }

  /**
   * Creates a request to garlandtools.org.
   * @param {string} uri
   * @returns {Observable}
   */
  public getGarlandData(uri: string): Observable<any> {
    return this.http.get<any>(this.garlandUrl + uri + '.json');
  }

  getSearchLang(): string {
    const lang = this.searchLang;
    if (lang === 'zh' && !this.isCompatible) {
      return 'chs';
    } else if (lang === 'ko' && !this.isCompatible) {
      return lang;
    } else if (['fr', 'en', 'ja', 'de'].indexOf(lang) === -1) {
      return 'en';
    }

    return lang;
  }

  searchAny(query: string, filters: SearchFilter[]): Observable<any[]> {
    // Filter HQ and Collectable Symbols from search
    query = query.replace(/[\ue03a-\ue03d]/g, '').toLowerCase();
    const otherSearch$ = this.xivapiSearch({
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
      string: query.split('-').join('–'),
      filters: [].concat.apply([], filters
        .filter(f => f.value !== null)
        .map(f => {
          if (f.minMax) {
            return [
              {
                column: f.name,
                operator: '>=',
                value: f.value.min
              },
              {
                column: f.name,
                operator: '<=',
                value: f.value.max
              }
            ];
          } else {
            return [{
              column: f.name,
              operator: '=',
              value: f.value
            }];
          }
        }))
    }).pipe(
      switchMap(res => {
        return safeCombineLatest(res.Results.map(row => {
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
          map(mapped => mapped.filter((r: SearchResult) => !!r && !!r.type))
        );
      })
    );
    return requestsWithDelay([
      this.searchItem(query, filters, false).pipe(map(res => res.map(row => {
        row.type = SearchType.ITEM;
        return row;
      }))),
      otherSearch$,
      this.searchFishingSpot(query, filters).pipe(map(res => res.map(row => {
        row.type = SearchType.FISHING_SPOT;
        return row;
      })))
    ], 100).pipe(
      map(results => [].concat.apply([], results))
    );
  }

  searchInstance(query: string, filters: SearchFilter[]): Observable<InstanceSearchResult[]> {
    return this.xivapiSearch({
      indexes: [SearchIndex.INSTANCECONTENT],
      columns: ['ID', 'Banner', 'Icon', 'ContentFinderCondition.ClassJobLevelRequired'],
      // I know, it looks like it's the same, but it isn't
      string: query.split('-').join('–'),
      filters: [].concat.apply([], filters
        .filter(f => f.value !== null)
        .map(f => {
          if (f.minMax) {
            return [
              {
                column: f.name,
                operator: '>=',
                value: f.value.min
              },
              {
                column: f.name,
                operator: '<=',
                value: f.value.max
              }
            ];
          } else {
            return [{
              column: f.name,
              operator: '=',
              value: f.value
            }];
          }
        }))
    }).pipe(
      map(res => {
        return res.Results.map(instance => {
          return this.mapInstance(instance);
        });
      })
    );
  }

  searchQuest(query: string, filters: SearchFilter[]): Observable<QuestSearchResult[]> {
    return this.xivapiSearch({
      indexes: [SearchIndex.QUEST],
      columns: ['ID', 'Banner', 'Icon'],
      // I know, it looks like it's the same, but it isn't
      string: query.split('-').join('–'),
      filters: [].concat.apply([], filters
        .filter(f => f.value !== null)
        .map(f => {
          if (f.minMax) {
            return [
              {
                column: f.name,
                operator: '>=',
                value: f.value.min
              },
              {
                column: f.name,
                operator: '<=',
                value: f.value.max
              }
            ];
          } else {
            return [{
              column: f.name,
              operator: '=',
              value: f.value
            }];
          }
        }))
    }).pipe(
      map(res => {
        return res.Results.map(quest => {
          return this.mapQuest(quest);
        });
      })
    );
  }

  searchAction(query: string, filters: SearchFilter[]): Observable<ActionSearchResult[]> {
    return this.xivapiSearch({
      indexes: [SearchIndex.ACTION, <SearchIndex>'craftaction'],
      columns: ['ID', 'Icon', 'ClassJobLevel', 'ClassJob', 'ClassJobCategory'],
      // I know, it looks like it's the same, but it isn't
      string: query.split('-').join('–'),
      filters: [].concat.apply([], filters
        .filter(f => f.value !== null)
        .map(f => {
          if (f.minMax) {
            return [
              {
                column: f.name,
                operator: '>=',
                value: f.value.min
              },
              {
                column: f.name,
                operator: '<=',
                value: f.value.max
              }
            ];
          } else {
            return [{
              column: f.name,
              operator: '=',
              value: f.value
            }];
          }
        }))
    }).pipe(
      map(res => {
        return res.Results.map(action => {
          return this.mapAction(action);
        });
      })
    );
  }

  searchTrait(query: string, filters: SearchFilter[]): Observable<ActionSearchResult[]> {
    return this.xivapiSearch({
      indexes: [<SearchIndex>'trait'],
      columns: ['ID', 'Icon', 'Level', 'ClassJob', 'ClassJobCategory'],
      // I know, it looks like it's the same, but it isn't
      string: query.split('-').join('–'),
      filters: [].concat.apply([], filters
        .filter(f => f.value !== null)
        .map(f => {
          if (f.minMax) {
            return [
              {
                column: f.name,
                operator: '>=',
                value: f.value.min
              },
              {
                column: f.name,
                operator: '<=',
                value: f.value.max
              }
            ];
          } else {
            return [{
              column: f.name,
              operator: '=',
              value: f.value
            }];
          }
        }))
    }).pipe(
      map(res => {
        return res.Results.map(trait => {
          return this.mapTrait(trait);
        });
      })
    );
  }

  searchStatus(query: string, filters: SearchFilter[]): Observable<StatusSearchResult[]> {
    return this.xivapiSearch({
      indexes: [SearchIndex.STATUS],
      columns: ['ID', 'Icon', 'Name_*', 'Description_*'],
      // I know, it looks like it's the same, but it isn't
      string: query.split('-').join('–'),
      filters: [].concat.apply([], filters
        .filter(f => f.value !== null)
        .map(f => {
          if (f.minMax) {
            return [
              {
                column: f.name,
                operator: '>=',
                value: f.value.min
              },
              {
                column: f.name,
                operator: '<=',
                value: f.value.max
              }
            ];
          } else {
            return [{
              column: f.name,
              operator: '=',
              value: f.value
            }];
          }
        }))
    }).pipe(
      map(res => {
        return res.Results.map(status => {
          return this.mapStatus(status);
        });
      })
    );
  }

  searchAchievement(query: string, filters: SearchFilter[]): Observable<StatusSearchResult[]> {
    return this.xivapiSearch({
      indexes: [SearchIndex.ACHIEVEMENT],
      columns: ['ID', 'Icon', 'Name_*', 'Description_*'],
      // I know, it looks like it's the same, but it isn't
      string: query.split('-').join('–'),
      filters: [].concat.apply([], filters
        .filter(f => f.value !== null)
        .map(f => {
          if (f.minMax) {
            return [
              {
                column: f.name,
                operator: '>=',
                value: f.value.min
              },
              {
                column: f.name,
                operator: '<=',
                value: f.value.max
              }
            ];
          } else {
            return [{
              column: f.name,
              operator: '=',
              value: f.value
            }];
          }
        }))
    }).pipe(
      map(res => {
        return res.Results.map(achievement => {
          return this.mapAchievement(achievement);
        });
      })
    );
  }

  searchLeve(query: string, filters: SearchFilter[]): Observable<LeveSearchResult[]> {
    return this.xivapiSearch({
      indexes: [SearchIndex.LEVE],
      columns: ['ID', 'Banner', 'Icon', 'ClassJobCategory', 'IconIssuer', 'ClassJobLevel'],
      // I know, it looks like it's the same, but it isn't
      string: query.split('-').join('–'),
      filters: [].concat.apply([], filters
        .filter(f => f.value !== null)
        .map(f => {
          if (f.minMax) {
            return [
              {
                column: f.name,
                operator: '>=',
                value: f.value.min
              },
              {
                column: f.name,
                operator: '<=',
                value: f.value.max
              }
            ];
          } else {
            return [{
              column: f.name,
              operator: '=',
              value: f.value
            }];
          }
        }))
    }).pipe(
      map(res => {
        return res.Results.map(leve => {
          return this.mapLeve(leve);
        });
      })
    );
  }

  searchNpc(query: string, filters: SearchFilter[]): Observable<NpcSearchResult[]> {
    return this.xivapiSearch({
      indexes: [SearchIndex.ENPCRESIDENT],
      columns: ['ID', 'Title_*', 'Icon'],
      // I know, it looks like it's the same, but it isn't
      string: query.split('-').join('–'),
      filters: [].concat.apply([], filters
        .filter(f => f.value !== null)
        .map(f => {
          if (f.minMax) {
            return [
              {
                column: f.name,
                operator: '>=',
                value: f.value.min
              },
              {
                column: f.name,
                operator: '<=',
                value: f.value.max
              }
            ];
          } else {
            return [{
              column: f.name,
              operator: '=',
              value: f.value
            }];
          }
        }))
    }).pipe(
      map(res => {
        return res.Results.map(npc => {
          return this.mapNpc(npc);
        });
      })
    );
  }

  searchMob(query: string, filters: SearchFilter[]): Observable<MobSearchResult[]> {
    return this.xivapiSearch({
      indexes: [SearchIndex.BNPCNAME],
      columns: ['ID', 'Icon'],
      // I know, it looks like it's the same, but it isn't
      string: query.split('-').join('–'),
      filters: [].concat.apply([], filters
        .filter(f => f.value !== null)
        .map(f => {
          if (f.minMax) {
            return [
              {
                column: f.name,
                operator: '>=',
                value: f.value.min
              },
              {
                column: f.name,
                operator: '<=',
                value: f.value.max
              }
            ];
          } else {
            return [{
              column: f.name,
              operator: '=',
              value: f.value
            }];
          }
        }))
    }).pipe(
      switchMap(res => {
        return safeCombineLatest(res.Results.map(mob => {
          return this.mapMob(mob);
        }));
      })
    );
  }

  searchFate(query: string, filters: SearchFilter[]): Observable<FateSearchResult[]> {
    return this.xivapiSearch({
      indexes: [SearchIndex.FATE],
      columns: ['ID', 'IconMap', 'ClassJobLevel'],
      // I know, it looks like it's the same, but it isn't
      string: query.split('-').join('–'),
      filters: [].concat.apply([], filters
        .filter(f => f.value !== null)
        .map(f => {
          if (f.minMax) {
            return [
              {
                column: f.name,
                operator: '>=',
                value: f.value.min
              },
              {
                column: f.name,
                operator: '<=',
                value: f.value.max
              }
            ];
          } else {
            return [{
              column: f.name,
              operator: '=',
              value: f.value
            }];
          }
        }))
    }).pipe(
      map(res => {
        return res.Results.map(fate => {
          return this.mapFate(fate);
        });
      })
    );
  }

  searchFishingSpot(query: string, filters: SearchFilter[]): Observable<FishingSpotSearchResult[]> {
    return this.lazyData.getEntry('fishingSpots').pipe(
      switchMap(fishingSpots => {
        return safeCombineLatest(
          fishingSpots.map(spot => {
            return combineLatest([
              this.i18n.getNameObservable('places', spot.zoneId),
              this.i18n.getMapName(spot.mapId)
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

  searchGatheringNode(query: string, filters: SearchFilter[]): Observable<GatheringNodeSearchResult[]> {
    return this.lazyData.getEntry('nodes').pipe(
      map(nodes => Object.entries(nodes).map(([key, node]) => ({ id: +key, ...node }))),
      switchMap(nodes => {
        return safeCombineLatest(
          nodes.map(node => {
            return combineLatest([
              this.i18n.getNameObservable('places', node.zoneid),
              this.i18n.getMapName(node.map)
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

  searchMap(query: string, filters: SearchFilter[]): Observable<MapSearchResult[]> {
    return this.xivapiSearch({
      indexes: [SearchIndex.PLACENAME],
      columns: ['ID', 'Name_*'],
      // I know, it looks like it's the same, but it isn't
      string: query.split('-').join('–'),
      filters: [].concat.apply([], filters
        .filter(f => f.value !== null)
        .map(f => {
          if (f.minMax) {
            return [
              {
                column: f.name,
                operator: '>=',
                value: f.value.min
              },
              {
                column: f.name,
                operator: '<=',
                value: f.value.max
              }
            ];
          } else {
            return [{
              column: f.name,
              operator: '=',
              value: f.value
            }];
          }
        }))
    }).pipe(
      map(res => {
        return res.Results.map(place => {
          return this.mapMap(place);
        }).filter(r => r !== null);
      })
    );
  }

  searchLore(query: string, filters: SearchFilter[]): Observable<any[]> {
    const options: XivapiOptions = {};
    if (this.settings.region === Region.China) {
      options.baseUrl = this.baseUrl;
    }

    return this.xivapi.searchLore(query, this.getSearchLang(), true, ['Icon', 'Name_*', 'Banner'], 1, options).pipe(
      withLazyData(this.lazyData, 'npcs', 'instances'),
      map(([searchResult, npcs, instances]) => {
        return searchResult.Results.map(row => {
          switch (row.Source.toLowerCase()) {
            case 'item':
            case 'leve':
            case 'quest': {
              row.Data.showButton = true;
              break;
            }
            case 'defaulttalk': {
              const npcId = Object.keys(npcs)
                .find(key => npcs[key].defaultTalks.indexOf(row.SourceID) > -1);
              if (npcId === undefined) {
                break;
              }
              row.Source = 'npc';
              row.SourceID = +npcId;
              row.Data.Icon = '/c/ENpcResident.png';
              row.Data.showButton = true;
              break;
            }
            case 'balloon': {
              const npcId = Object.keys(npcs)
                .find(key => npcs[key].balloon === row.SourceID);
              if (npcId === undefined) {
                break;
              }
              row.Source = 'npc';
              row.SourceID = +npcId;
              row.Data.Icon = '/c/ENpcResident.png';
              row.Data.showButton = true;
              break;
            }
            case 'instancecontenttextdata': {
              const instanceId = Object.keys(instances)
                .find(key => (instances[key].contentText || []).indexOf(row.SourceID) > -1);
              if (instanceId === undefined) {
                break;
              }
              row.Source = 'instance';
              row.SourceID = +instanceId;
              row.Data.showButton = true;
              break;
            }
          }
          return row;
        });
      })
    );
  }

  /**
   * Creates a search request to garlandtools.org.
   * @param {HttpParams} query
   * @returns {Observable}
   */
  private getGarlandSearch(query: HttpParams): Observable<any> {
    return this.http.get<any>(`${this.garlandApiUrl}/search.php`, { params: query });
  }

  private mapToItemIds(terms: string, lang: 'ko' | 'zh'): Observable<number[]> {
    return this.lazyData.getEntry(lang === 'ko' ? 'koItems' : 'zhItems').pipe(
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
    return this.lazyData.getRow('monsters', mob.ID).pipe(
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
      title: this.i18n.xivapiToI18n(npc, 'Title'),
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
      job: this.i18n.xivapiToI18n(leve.ClassJobCategory)
    };
  }

  private mapMap(place: any): MapSearchResult {
    const entry = mapIds.find(m => m.zone === place.ID);
    if (entry === undefined) {
      return null;
    }
    return {
      id: entry.id,
      zoneid: place.ID,
      type: SearchType.MAP
    };
  }
}
