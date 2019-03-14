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

@Injectable()
export class DataService {

  private garlandUrl = 'https://www.garlandtools.org/db/doc';
  private garlandtoolsVersion = 3;
  private garlandApiUrl = 'https://www.garlandtools.org/api';

  constructor(private http: HttpClient,
              private i18n: TranslateService,
              private gt: GarlandToolsService,
              private serializer: NgSerializerService,
              private lazyData: LazyDataService) {
  }

  /**
   * Gets an item based on its id.
   * @param {number} id
   * @returns {Observable<ItemData>}
   */
  public getItem(id: number): Observable<ItemData> {
    return this.getGarlandData(`/item/en/${this.garlandtoolsVersion}/${id}`)
      .pipe(map(item => this.serializer.deserialize<ItemData>(item, ItemData)));
  }

  /**
   * Fires a search request to the search api in order to get results based on filters.
   * @param {string} query
   * @param {SearchFilter[]} filters
   * @param onlyCraftable
   * @returns {Observable<Recipe[]>}
   */
  public searchItem(query: string, filters: SearchFilter[], onlyCraftable: boolean): Observable<SearchResult[]> {
    let lang = this.i18n.currentLang;
    const isKoOrZh = ['ko', 'zh'].indexOf(this.i18n.currentLang.toLowerCase()) > -1;
    if (isKoOrZh) {
      lang = 'en';
    }
    let params = new HttpParams()
      .set('type', 'item')
      .set('lang', lang);

    if (onlyCraftable) {
      params = params.set('craftable', '1');
    }

    let craftedByFilter: SearchFilter;

    // If the lang is korean, handle it properly to map to item ids.
    if (isKoOrZh) {
      const ids = this.mapToItemIds(query, this.i18n.currentLang as 'ko' | 'zh');
      params = params.set('ids', ids.join(','));
    }

    if (query !== undefined && !isKoOrZh) {
      params = params.set('text', query);
    }

    filters.forEach(filter => {
      if (filter.minMax) {
        params = params.set(`${filter.name}Min`, filter.value.min)
          .set(`${filter.name}Max`, filter.value.max);
      } else if (filter.name === 'jobCategories') {
        params = params.set(filter.name, this.gt.getJobCategories(filter.value).join(','));
      } else {
        params = params.set(filter.name, filter.value);
      }
      if (filter.name === 'craftJob') {
        craftedByFilter = filter;
      }
    });

    return this.getGarlandSearch(params)
      .pipe(
        map(garlandResults => {
          const results: SearchResult[] = [];
          garlandResults.forEach(item => {
            if (item.obj.f !== undefined) {
              item.obj.f.forEach(recipe => {
                if (craftedByFilter !== undefined && craftedByFilter.value !== recipe.job) {
                  return;
                }
                results.push({
                  itemId: item.id,
                  icon: item.obj.c,
                  amount: 1,
                  recipe: {
                    recipeId: recipe.id,
                    itemId: item.id,
                    collectible: item.obj.o === 1,
                    job: recipe.job,
                    stars: recipe.stars,
                    lvl: recipe.lvl,
                    icon: item.obj.c
                  }
                });
              });
            } else {
              results.push({
                itemId: item.id,
                icon: item.obj.c,
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
        return this.getGarlandData(`/item/en/${this.garlandtoolsVersion}/${itemIds.join(',')}`)
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
  private getGarlandData(uri: string): Observable<any> {
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
        return data[key][lang].indexOf(terms) > -1;
      })
      .map(key => +key);
  }
}
