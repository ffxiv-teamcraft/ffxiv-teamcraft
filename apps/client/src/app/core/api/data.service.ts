import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { NgSerializerService } from '@kaiu/ng-serializer';
import { catchError, map } from 'rxjs/operators';
import { XivapiOptions, XivapiService } from '@xivapi/angular-client';
import { Region, SearchFilter, SearchResult, SearchType } from '@ffxiv-teamcraft/types';
import { I18nToolsService } from '../tools/i18n-tools.service';
import { SettingsService } from '../../modules/settings/settings.service';
import { Language } from '../data/language';
import { LazyDataFacade } from '../../lazy-data/+state/lazy-data.facade';
import { withLazyData } from '../rxjs/with-lazy-data';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DataService {

  public searchLang = this.translate.currentLang;

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
    return this.search(query, onlyCraftable ? SearchType.RECIPE : SearchType.ITEM, filters, sort);
  }

  public search(query: string, type: SearchType, rawFilters: SearchFilter[], sort: [string, 'asc' | 'desc'] = [null, 'desc']): Observable<SearchResult[]> {
    if (type === SearchType.LORE) {
      return this.searchLore(query);
    }
    const filters = rawFilters
      .filter(f => f.value !== null)
      .map(f => {
        if (f.minMax) {
          if (f.value.exclude) {
            return [
              {
                column: f.name,
                operator: '!!',
                value: ''
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
        } else if (Array.isArray(f.value)) {
          return [{
            column: f.name,
            operator: '|=',
            value: f.value.filter(Boolean).join(';')
          }];
        } else {
          return [{
            column: f.name,
            operator: '=',
            value: f.value
          }];
        }
      })
      .flat()
      .map(filter => `${filter.column}${filter.operator}${filter.value}`)
      .join(',');
    const params: any = {
      query,
      type,
      lang: this.searchLang
    };
    if (filters.length > 0) {
      params['filters'] = filters;
    }
    if (sort[0]) {
      params['sort_field'] = sort[0];
      params['sort_order'] = sort[1];
    }
    if (environment.useLocalAPI) {
      return this.devSearch(params);
    }
    return this.prodSearch(params);
  }

  private devSearch(params: any): Observable<SearchResult[]> {
    // If dev search isn't available, just use prod search !
    return this.http.get<SearchResult[]>('http://localhost:3333/search', { params }).pipe(
      catchError(() => this.prodSearch(params))
    );
  }

  private prodSearch(params: any): Observable<SearchResult[]> {
    return this.http.get<SearchResult[]>('https://api.ffxivteamcraft.com/search', { params });
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

  searchLore(query: string): Observable<any[]> {
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
}
