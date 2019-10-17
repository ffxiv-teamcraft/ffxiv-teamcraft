import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { GarlandToolsService } from './garland-tools.service';
import { Recipe } from '../../model/search/recipe';
import { ItemData } from '../../model/garland-tools/item-data';
import { NgSerializerService } from '@kaiu/ng-serializer';
import { SearchFilter } from '../../model/search/search-filter.interface';
import { map, switchMap } from 'rxjs/operators';
import { SearchResult } from '../../model/search/search-result';
import { LazyDataService } from '../data/lazy-data.service';
import { InstanceData } from '../../model/garland-tools/instance-data';
import { QuestData } from '../../model/garland-tools/quest-data';
import { NpcData } from '../../model/garland-tools/npc-data';
import { LeveData } from '../../model/garland-tools/leve-data';
import { MobData } from '../../model/garland-tools/mob-data';
import { FateData } from '../../model/garland-tools/fate-data';
import {
  SearchAlgo,
  SearchIndex,
  XivapiEndpoint,
  XivapiSearchFilter,
  XivapiSearchOptions,
  XivapiService
} from '@xivapi/angular-client';

@Injectable()
export class DataService {

  private garlandUrl = 'https://www.garlandtools.org/db/doc';
  public garlandtoolsVersions = {
    item: 3,
    instance: 2,
    quest: 2,
    npc: 2,
    leve: 3,
    mob: 2,
    fate: 2
  };
  private garlandApiUrl = 'https://www.garlandtools.org/api';

  constructor(private http: HttpClient,
              private i18n: TranslateService,
              private gt: GarlandToolsService,
              private xivapi: XivapiService,
              private serializer: NgSerializerService,
              private lazyData: LazyDataService) {
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
   * @returns {Observable<Recipe[]>}
   */
  public searchItem(query: string, filters: SearchFilter[], onlyCraftable: boolean, sort: [string, 'asc' | 'desc'] = [null, 'desc']): Observable<SearchResult[]> {
    let lang = this.i18n.currentLang;
    const isKoOrZh = ['ko', 'zh'].indexOf(this.i18n.currentLang.toLowerCase()) > -1 && query.length > 0;
    if (isKoOrZh) {
      lang = 'en';
    }

    const xivapiFilters: XivapiSearchFilter[] = [].concat.apply([], filters
      .filter(f => {
        return f.value !== null;
      })
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

    const searchOptions: XivapiSearchOptions = {
      indexes: [SearchIndex.ITEM],
      string: query,
      language: lang,
      filters: xivapiFilters,
      columns: ['ID', 'Name_*', 'Icon', 'Recipes', 'GameContentLinks'],
      string_algo: SearchAlgo.WILDCARD_PLUS
    };

    if (sort[0]) {
      searchOptions.sort_field = sort[0];
    }
    searchOptions.sort_order = sort[1];

    let results$ = this.xivapi.search(searchOptions).pipe(
      map((response) => {
        return response.Results;
      })
    );

    if (isKoOrZh) {
      results$ = this.xivapi.getList(
        XivapiEndpoint.Item,
        {
          ids: this.mapToItemIds(query, this.i18n.currentLang as 'ko' | 'zh'),
          columns: ['ID', 'Name_*', 'Icon', 'Recipes', 'GameContentLinks'],
        }
      ).pipe(
        map(items => {
          return items.Results.filter(item => {
            return xivapiFilters.reduce((matches, filter) => {
              switch (filter.operator) {
                case '>=':
                  return matches && item[filter.column] >= filter.value;
                case '<=':
                  return matches && item[filter.column] <= filter.value;
                case '=':
                  return matches && item[filter.column] === filter.value;
                case '<':
                  return matches && item[filter.column] < filter.value;
                case '>':
                  return matches && item[filter.column] > filter.value;
              }
            }, true);
          });
        })
      );
    }

    return results$.pipe(
      map(results => {
        if (onlyCraftable) {
          return results.filter(row => {
            return (row.Recipes && row.Recipes.length > 0) || (row.GameContentLinks && row.GameContentLinks.CompanyCraftSequence && row.GameContentLinks.CompanyCraftSequence.ResultItem);
          });
        }
        return results;
      }),
      map(xivapiSearchResults => {
        const results: SearchResult[] = [];
        xivapiSearchResults.forEach(item => {
          const recipes = this.lazyData.recipes.filter(recipe => recipe.result === item.ID);
          if (recipes.length > 0) {
            recipes
              .forEach(recipe => {
                results.push({
                  itemId: item.ID,
                  icon: `https://xivapi.com${item.Icon}`,
                  amount: 1,
                  recipe: {
                    recipeId: recipe.id.toString(),
                    itemId: item.ID,
                    collectible: item.GameContentLinks && item.GameContentLinks.MasterpieceSupplyDuty,
                    job: recipe.job,
                    stars: recipe.stars,
                    lvl: recipe.level,
                    icon: `https://xivapi.com${item.Icon}`
                  }
                });
              });
          } else {
            results.push({
              itemId: item.ID,
              icon: `https://xivapi.com${item.Icon}`,
              amount: 1
            });
          }
        });
        return results;
      })
    );
  }

  /**
   * Searches for gathering items based on a given name.
   * Will return an observable of empty array if name is shorter than 3 characters.
   *
   * @param {string} name
   * @returns {Observable<ItemData[]>}
   */
  public searchGathering(name: string): Observable<any[]> {
    let lang = this.i18n.currentLang;
    const isKoOrZh = ['ko', 'zh'].indexOf(this.i18n.currentLang.toLowerCase()) > -1;
    if (isKoOrZh) {
      if (name.length > 0) {
        lang = 'en';
      } else {
        return of([]);
      }
    } else if (name.length < 3) {
      return of([]);
    }

    let params = new HttpParams()
      .set('gatherable', '1')
      .set('type', 'item')
      .set('lang', lang);

    // If the lang is korean, handle it properly to map to item ids.
    if (isKoOrZh) {
      const ids = this.mapToItemIds(name, this.i18n.currentLang as 'ko' | 'zh');
      params = params.set('ids', ids.join(','));
    } else {
      params = params.set('text', name);
    }

    return this.getGarlandSearch(params).pipe(
      switchMap(results => {
        const itemIds = (results || []).map(item => item.obj.i);
        if (itemIds.length === 0) {
          return of([]);
        }
        return this.getGarlandData(`/item/en/${this.garlandtoolsVersions.item}/${itemIds.join(',')}`)
          .pipe(
            map(items => {
              if (!(items instanceof Array)) {
                items = [{ obj: items }];
              }
              return items.map(itemData => {
                const itemPartial = results.find(res => res.obj.i === itemData.obj.item.id);
                return {
                  ...itemPartial,
                  nodes: itemData.obj.item.nodes
                };
              });
            })
          );
      })
    );
  }

  /**
   * Creates a request to garlandtools.org.
   * @param {string} uri
   * @returns {Observable<any>}
   */
  public getGarlandData(uri: string): Observable<any> {
    return this.http.get<any>(this.garlandUrl + uri + '.json');
  }

  /**
   * Creates a search request to garlandtools.org.
   * @param {HttpParams} query
   * @returns {Observable<any>}
   */
  private getGarlandSearch(query: HttpParams): Observable<any> {
    return this.http.get<any>(`${this.garlandApiUrl}/search.php`, { params: query });
  }

  private mapToItemIds(terms: string, lang: 'ko' | 'zh'): number[] {
    const data = lang === 'ko' ? this.lazyData.koItems : this.lazyData.zhItems;
    return Object.keys(data)
      .filter(key => {
        return data[key][lang].indexOf(terms) > -1 && !/(\D+)/.test(key);
      })
      .map(key => {
        return +key;
      });
  }
}
