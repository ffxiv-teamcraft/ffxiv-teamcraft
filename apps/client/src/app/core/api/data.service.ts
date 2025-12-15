import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { catchError } from 'rxjs/operators';
import { ExtractRow, I18nName, SearchFilter, SearchResult, SearchType } from '@ffxiv-teamcraft/types';
import { SettingsService } from '../../modules/settings/settings.service';
import { Language } from '../data/language';
import { environment } from '../../../environments/environment';
import { LazyItemSearch } from '@ffxiv-teamcraft/data/model/lazy-item-search';
import { LazyActionSearch } from '@ffxiv-teamcraft/data/model/lazy-action-search';
import { LazyMonsterSearch } from '@ffxiv-teamcraft/data/model/lazy-monster-search';
import { LazyLeveSearch } from '@ffxiv-teamcraft/data/model/lazy-leve-search';
import { LazyInstanceSearch } from '@ffxiv-teamcraft/data/model/lazy-instance-search';
import { LazyMapSearch } from '@ffxiv-teamcraft/data/model/lazy-map-search';
import { LazyQuestSearch } from '@ffxiv-teamcraft/data/model/lazy-quest-search';
import { LazyAchievementSearch } from '@ffxiv-teamcraft/data/model/lazy-achievement-search';
import { LazyFateSearch } from '@ffxiv-teamcraft/data/model/lazy-fate-search';
import { LazyFishingSpotSearch } from '@ffxiv-teamcraft/data/model/lazy-fishing-spot-search';
import { LazyGatheringNodeSearch } from '@ffxiv-teamcraft/data/model/lazy-gathering-node-search';
import { LazyNpcSearch } from '@ffxiv-teamcraft/data/model/lazy-npc-search';
import { LazyStatusSearch } from '@ffxiv-teamcraft/data/model/lazy-status-search';
import { LazyTraitSearch } from '@ffxiv-teamcraft/data/model/lazy-trait-search';
import { IpcService } from '../electron/ipc.service';
import { PlatformService } from '../tools/platform.service';
import { SearchParams, XIVSearchFilter } from '@ffxiv-teamcraft/search';

@Injectable({ providedIn: 'root' })
export class DataService {

  public readonly availableLanguages = ['en', 'de', 'fr', 'ja', 'ko', 'zh', 'tw'];

  public searchLang = this.settings.searchLanguage || this.translate.currentLang;

  public ingesting$ = new BehaviorSubject(false);

  constructor(private http: HttpClient,
              private ipc: IpcService,
              private platform: PlatformService,
              private settings: SettingsService,
              private translate: TranslateService) {
    if (this.platform.isDesktop()) {
      this.ipc.on('search:ingest', (event, ingesting) => {
        this.ingesting$.next(ingesting);
      });
    }
    if (!this.availableLanguages.includes(this.searchLang)) {
      this.searchLang = 'en';
    }
  }

  public setSearchLang(lang: Language): void {
    if (!this.availableLanguages.includes(lang)) {
      lang = 'en';
    }
    this.searchLang = lang;
    if (this.platform.isDesktop()) {
      this.ipc.send('search:lang', lang);
    }
  }

  public searchItem(query: string, filters: SearchFilter[], onlyCraftable: boolean, sort: [string, 'asc' | 'desc'] = [null, 'desc'], ignoreLanguageSetting = false) {
    return this.search(query, onlyCraftable ? SearchType.RECIPE : SearchType.ITEM, filters, sort);
  }

  public search(query: string, type: SearchType.ITEM, rawFilters: SearchFilter[], sort?: [string, 'asc' | 'desc']): Observable<Array<LazyItemSearch['data'] & I18nName & {
    sources: ExtractRow['sources']
  }>>
  public search(query: string, type: SearchType.RECIPE, rawFilters: SearchFilter[], sort?: [string, 'asc' | 'desc']): Observable<Array<LazyItemSearch['data'] & I18nName & {
    sources: ExtractRow['sources']
  }>>
  public search(query: string, type: SearchType.ACTION, rawFilters: SearchFilter[], sort?: [string, 'asc' | 'desc']): Observable<Array<LazyActionSearch['data'] & I18nName>>
  public search(query: string, type: SearchType.MONSTER, rawFilters: SearchFilter[], sort?: [string, 'asc' | 'desc']): Observable<Array<LazyMonsterSearch['data'] & I18nName>>
  public search(query: string, type: SearchType.LEVE, rawFilters: SearchFilter[], sort?: [string, 'asc' | 'desc']): Observable<Array<LazyLeveSearch['data'] & I18nName>>
  public search(query: string, type: SearchType.INSTANCE, rawFilters: SearchFilter[], sort?: [string, 'asc' | 'desc']): Observable<Array<LazyInstanceSearch['data'] & I18nName>>
  public search(query: string, type: SearchType.MAP, rawFilters: SearchFilter[], sort?: [string, 'asc' | 'desc']): Observable<Array<LazyMapSearch['data'] & I18nName>>
  public search(query: string, type: SearchType.QUEST, rawFilters: SearchFilter[], sort?: [string, 'asc' | 'desc']): Observable<Array<LazyQuestSearch['data'] & I18nName>>
  public search(query: string, type: SearchType.ACHIEVEMENT, rawFilters: SearchFilter[], sort?: [string, 'asc' | 'desc']): Observable<Array<LazyAchievementSearch['data'] & I18nName>>
  public search(query: string, type: SearchType.FATE, rawFilters: SearchFilter[], sort?: [string, 'asc' | 'desc']): Observable<Array<LazyFateSearch['data'] & I18nName>>
  public search(query: string, type: SearchType.FISHING_SPOT, rawFilters: SearchFilter[], sort?: [string, 'asc' | 'desc']): Observable<Array<LazyFishingSpotSearch['data'] & I18nName>>
  public search(query: string, type: SearchType.GATHERING_NODE, rawFilters: SearchFilter[], sort?: [string, 'asc' | 'desc']): Observable<Array<LazyGatheringNodeSearch['data'] & I18nName>>
  public search(query: string, type: SearchType.NPC, rawFilters: SearchFilter[], sort?: [string, 'asc' | 'desc']): Observable<Array<LazyNpcSearch['data'] & I18nName>>
  public search(query: string, type: SearchType.STATUS, rawFilters: SearchFilter[], sort?: [string, 'asc' | 'desc']): Observable<Array<LazyStatusSearch['data'] & I18nName>>
  public search(query: string, type: SearchType.TRAIT, rawFilters: SearchFilter[], sort?: [string, 'asc' | 'desc']): Observable<Array<LazyTraitSearch['data'] & I18nName>>
  public search(query: string, type: SearchType, rawFilters: SearchFilter[], sort?: [string, 'asc' | 'desc']): Observable<Array<SearchResult & I18nName>>
  public search(query: string, type: SearchType, rawFilters: SearchFilter[], sort: [string, 'asc' | 'desc'] = [null, 'desc']) {
    const filters = rawFilters
      .filter(f => f.value !== null)
      .map(f => {
        if (f.minMax) {
          if (f.value.exclude) {
            return [
              {
                field: f.name,
                operator: '!!',
                value: ''
              }
            ];
          } else {
            return [
              {
                field: f.name,
                operator: '>=',
                value: f.value.min
              },
              {
                field: f.name,
                operator: '<=',
                value: f.value.max
              }
            ];
          }
        } else if (Array.isArray(f.value)) {
          return [{
            field: f.name,
            operator: '|=',
            value: f.value.filter(Boolean)
          }];
        } else {
          return [{
            field: f.name,
            operator: '=',
            value: f.value
          }];
        }
      })
      .flat();
    const params: SearchParams = {
      query,
      type,
      sort,
      filters: filters as XIVSearchFilter[],
      lang: this.searchLang as keyof I18nName
    };
    if (this.platform.isDesktop()) {
      return new Observable(subscriber => {
        this.ipc.once('search:results', (event, res) => {
          subscriber.next(res);
          subscriber.complete();
        });
        this.ipc.send('search', { ...params, filters, sort });
      });
    } else {
      if (filters.length > 0) {
        (params as any).filters = filters
          .map(filter => `${filter.field}${filter.operator}${Array.isArray(filter.value) ? filter.value.join(';') : filter.value}`)
          .join(',');
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
}
