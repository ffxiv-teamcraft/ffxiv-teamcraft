import { Injectable } from '@angular/core';

import { select, Store } from '@ngrx/store';
import { combineLatest, Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, first, map, shareReplay, skipWhile, switchMap, tap } from 'rxjs/operators';

import * as fromLazyData from './lazy-data.reducer';
import * as LazyDataSelectors from './lazy-data.selectors';
import { loadLazyDataEntityEntry, loadLazyDataFullEntity } from './lazy-data.actions';
import { I18nElement, LazyDataEntries, LazyDataI18nKey, LazyDataKey, LazyDataRecordKey, LazyDataWithExtracts } from '../lazy-data-types';
import { I18nName } from '../../model/common/i18n-name';
import { SettingsService } from '../../modules/settings/settings.service';
import { Region } from '../../modules/settings/region.enum';
import { zhWorlds } from '../../core/data/sources/zh-worlds';
import { koWorlds } from '../../core/data/sources/ko-worlds';
import { LoadingStatus } from '../data-entry-status';
import { LazyRecipe } from '../model/lazy-recipe';
import { XivapiPatch } from '../../core/data/model/xivapi-patch';
import { HttpClient } from '@angular/common/http';
import { mapIds } from '../../core/data/sources/map-ids';
import { XivapiService } from '@xivapi/angular-client';
import { Language } from '../../core/data/language';
import { normalizeI18nName } from '../../core/tools/normalize-i18n';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class LazyDataFacade {

  private static readonly CACHE_TTL = 30000;

  public isLoading$ = this.store.pipe(
    select(LazyDataSelectors.isLoading)
  );

  public patches$ = this.http.get<XivapiPatch[]>('https://xivapi.com/patchlist').pipe(
    shareReplay({ bufferSize: 1, refCount: true })
  );

  public datacenters$ = this.xivapi.getDCList().pipe(
    shareReplay({ bufferSize: 1, refCount: true })
  );

  // This is a temporary cache system to absorb possible call spams on some methods, TTL for each row is 10s toa void memory issues
  private cache: Record<string, Observable<any>> = {};

  private searchIndexCache: Record<string, Observable<{ id: number, name: I18nName }[]>> = {};

  constructor(private store: Store<fromLazyData.LazyDataPartialState>,
              private settings: SettingsService, private http: HttpClient,
              private xivapi: XivapiService, private translate: TranslateService) {
    this.isLoading$
      .pipe(
        skipWhile(loading => !loading),
        debounceTime(1500),
        filter(loading => !loading),
        first()
      )
      .subscribe(() => {
        // Indicate the headless renderer that we're done
        (window as any).renderComplete = true;
      });
  }

  public preloadEntry<K extends LazyDataKey>(propertyKey: K): void {
    this.getStatus(propertyKey).pipe(
      first()
    ).subscribe((status) => {
      if (status !== 'full' && status !== 'loading') {
        this.store.dispatch(loadLazyDataFullEntity({ entity: propertyKey }));
      }
    });
  }

  /**
   * Gets an entire file worth of data at once.
   * @param propertyKey the name of the property you want to load inside the lazy data system.
   */
  public getEntry<K extends LazyDataKey>(propertyKey: K): Observable<LazyDataWithExtracts[K]> {
    if (this.getCacheEntry(propertyKey) === null) {
      const obs$ = combineLatest([
        this.store.pipe(select(LazyDataSelectors.getEntry(propertyKey))),
        this.getStatus(propertyKey)
      ]).pipe(
        tap(([, status]) => {
          const loadingOrLoaded = status === 'full' || status === 'loading';
          if (!loadingOrLoaded) {
            this.store.dispatch(loadLazyDataFullEntity({ entity: propertyKey }));
          }
        }),
        filter(([, status]) => status === 'full'),
        map(([res]) => res),
        filter(res => !!res),
        first()
      );
      this.cacheObservable(obs$, propertyKey);
    }
    return this.getCacheEntry(propertyKey);
  }

  /**
   * Gets an entire file worth of data at once.
   * @param propertyKey the name of the property you want to load inside the lazy data system.
   * @param forceAll If you want all the languages no matter the current region.
   */
  public getI18nEntry<K extends LazyDataI18nKey>(propertyKey: K, forceAll = false): Observable<Record<number, I18nName>> {
    return this.settings.region$.pipe(
      switchMap(region => {
        return this.getEntry(propertyKey).pipe(
          switchMap(entry => {
            const global$ = of(this.merge(entry));
            const cn$ = this.getEntry(this.findPrefixedProperty(propertyKey, 'zh'));
            const kr$ = this.getEntry(this.findPrefixedProperty(propertyKey, 'ko'));

            if (forceAll) {
              return combineLatest([
                global$,
                cn$, kr$
              ]).pipe(
                map(([global, cn, kr]) => {
                  return this.merge(global, cn, kr);
                })
              );
            }

            switch (region) {
              case Region.Global:
                // Merging entry with itself just to normalize i18n names
                return global$;
              case Region.China:
                return cn$.pipe(
                  map(zhEntry => {
                    return this.merge(entry, zhEntry);
                  })
                );
              case Region.Korea:
                return kr$.pipe(
                  map(koRow => {
                    return this.merge(entry, koRow);
                  })
                );
            }
          })
        );
      })
    );
  }

  public getRow<K extends LazyDataRecordKey>(propertyKey: K, id: number): Observable<LazyDataEntries[K] | null>;
  /**
   * Gets a single entry of a given property
   * @param propertyKey the name of the property to get the id from
   * @param id the id of the row you want to load
   * @param fallback fallback value if nothing is found
   */
  public getRow<K extends LazyDataRecordKey>(propertyKey: K, id: number, fallback: Partial<LazyDataEntries[K]>): Observable<Partial<LazyDataEntries[K]> | LazyDataEntries[K]>;
  public getRow<K extends LazyDataRecordKey>(propertyKey: K, id: number, fallback?: Partial<LazyDataEntries[K]>): Observable<LazyDataEntries[K] | null> | Observable<Partial<LazyDataEntries[K]> | LazyDataEntries[K]> {
    if (this.getCacheEntry(propertyKey, id) === null) {
      // If we asked for more than 50 separate things in the same entry during the last CACHE_TTL and it's not extracts, load the entire entry.
      if (propertyKey !== 'extracts' && Object.keys(this.cache).filter(key => key.startsWith(`${propertyKey}:`)).length > 50) {
        this.preloadEntry(propertyKey);
      }
      const obs$ = combineLatest([
        this.store.pipe(select(LazyDataSelectors.getEntryRow, { key: propertyKey, id })),
        this.getStatus(propertyKey, id)
      ]).pipe(
        tap(([res, status]) => {
          const loadingOrLoaded = status === 'full' || status === 'loading';
          if (!res && !loadingOrLoaded) {
            this.store.dispatch(loadLazyDataEntityEntry({ entity: propertyKey, id }));
          }
        }),
        switchMap(([res, status]) => {
          if (status === 'full' && !res) {
            if (propertyKey.startsWith('zh') || propertyKey.startsWith('ko')) {
              const globalPropertyKey = propertyKey.replace(/^ko|zh/, '');
              return this.getRow(`${globalPropertyKey[0].toLowerCase()}${globalPropertyKey.slice(1)}` as LazyDataRecordKey, id, fallback);
            }
            return of(fallback || null);
          } else if (res) {
            return of(res);
          }
          return of(undefined);
        }),
        filter(res => res !== undefined || (fallback !== undefined && res === fallback)),
        first()
      );
      this.cacheObservable(obs$, propertyKey, id);
    }
    return this.getCacheEntry(propertyKey, id);
  }

  /**
   * Get the status of a lazy data entry in the store
   * @param propertyKey the property to get the status from
   * @param id id of the entry to get the status for
   */
  public getStatus<K extends LazyDataKey>(propertyKey: K, id?: number): Observable<LoadingStatus | null> {
    return this.store.pipe(
      select(LazyDataSelectors.getEntryStatus, { key: propertyKey }),
      map(row => {
        if (!row) {
          return null;
        }
        if (id !== undefined) {
          return row.record[id] || row.status;
        }
        return row.status;
      }),
      distinctUntilChanged()
    );
  }

  /**
   * Get I18nName structure for a given row in a given lazy loaded entry
   * @param propertyKey the lazy loaded data entry name
   * @param id the id to get the name for
   * @param extendedProperty if we want to grab data for a sub field (like "description" for instance)
   */
  public getI18nName<K extends LazyDataI18nKey>(propertyKey: K, id: number, extendedProperty?: keyof Extract<LazyDataEntries[K], I18nName>): Observable<I18nName | null> {
    if (id === null) {
      return of(null);
    }
    return this.settings.region$.pipe(
      switchMap(region => {
        return this.getRow(propertyKey, id).pipe(
          map(row => {
            if (!row) {
              return null;
            }
            return normalizeI18nName(extendedProperty ? row[extendedProperty as string] : row);
          }),
          switchMap(row => {
            if (!row) {
              return of(null);
            }
            if (this.translate.currentLang === 'ko') {
              region = Region.Korea;
            }
            if (this.translate.currentLang === 'zh') {
              region = Region.China;
            }
            switch (region) {
              case Region.Global:
                return of(row);
              case Region.China:
                return this.getRow(this.findPrefixedProperty(propertyKey, 'zh'), id).pipe(
                  map(zhRow => {
                    return {
                      ...row,
                      ...normalizeI18nName(extendedProperty ? row[extendedProperty as string] : zhRow)
                    };
                  })
                );
              case Region.Korea:
                return this.getRow(this.findPrefixedProperty(propertyKey, 'ko'), id).pipe(
                  map(koRow => {
                    return {
                      ...row,
                      ...normalizeI18nName(extendedProperty ? row[extendedProperty as string] : koRow)
                    };
                  })
                );
            }
          })
        );
      })
    );
  }

  /**
   * PUBLIC UTILITY METHODS
   */
  public getMapId(name: string): number {
    const result = mapIds.find((m) => m.name === name);
    if (result === undefined) {
      if (name === 'Gridania') {
        return 2;
      }
      if (name.startsWith('Eulmore - ')) {
        return 498;
      }
      // Diadem
      if (name === 'The Diadem') {
        return 538;
      }
      return -1;
    }
    return result.id;
  }

  public getWorldName(world: string): I18nName {
    return {
      fr: world,
      en: world,
      de: world,
      ja: world,
      zh: zhWorlds[world] ?? world,
      ko: koWorlds[world] ?? world,
      ru: world
    };
  }

  public getRecipes(): Observable<LazyRecipe[]> {
    switch (this.settings.region) {
      case Region.China:
        return combineLatest([
          this.getEntry('zhRecipes'),
          this.getEntry('recipes')
        ]).pipe(
          map(([eRecipes, recipes]) => {
            return recipes.map(r => {
              const eRecipe = eRecipes.find(e => e.id === r.id);
              return eRecipe || r;
            });
          }),
          shareReplay({ bufferSize: 1, refCount: true })
        );
      case Region.Korea:
        return combineLatest([
          this.getEntry('koRecipes'),
          this.getEntry('recipes')
        ]).pipe(
          map(([eRecipes, recipes]) => {
            return recipes.map(r => {
              const eRecipe = eRecipes.find(e => e.id === r.id);
              return eRecipe || r;
            });
          }),
          shareReplay({ bufferSize: 1, refCount: true })
        );
      default:
        return this.getEntry('recipes');
    }
  }

  public getDatacenterForServer(server: string): Observable<string> {
    return this.datacenters$.pipe(
      map(datacenters => {
        const fromData = Object.keys(datacenters)
          .find(dc => {
            return datacenters[dc].some(s => s.toLowerCase() === server.toLowerCase());
          });
        if (!fromData && server.toLowerCase().includes('korean')) {
          return 'Korea';
        }
      })
    );
  }

  public getMinBtnSpearNodesIndex(): Observable<(Omit<LazyDataEntries['nodes'], 'zoneid'> & { id: number, zoneId: number })[]> {
    return this.getEntry('nodes').pipe(
      map(nodes => {
        return Object.entries(nodes)
          .map(([key, value]) => {
            const res = {
              ...value,
              id: +key,
              zoneId: value.zoneid
            };
            delete res.zoneid;
            return res;
          });
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }

  public getRecipeForItem(id: number | string): Observable<LazyRecipe> {
    return this.getRecipes().pipe(
      map(recipes => recipes.find((r) => (r as any).result.toString() === id.toString()))
    );
  }

  public getRecipe(id: number | string): Observable<LazyRecipe> {
    return this.getRecipes().pipe(
      map(recipes => recipes.find((r) => (r as any).id.toString() === id.toString()))
    );
  }

  public getJobIdByAbbr(abbr: string): Observable<number> {
    return this.getEntry('jobAbbr').pipe(
      map(abbrs => +Object.keys(abbrs).find(key => abbrs[key].en === abbr))
    );
  }

  public getI18nItems(): Observable<Record<number, Partial<I18nName>>> {
    switch (this.settings.region) {
      case Region.China:
        return this.getEntry('zhItems');
      case Region.Korea:
        return this.getEntry('koItems');
      default:
        return this.getEntry('items');
    }
  }

  public getIndexByName(property: LazyDataI18nKey, name: string, lang: Language, flip = false): Observable<number | null> {
    // If it's Chinese
    if (lang === 'zh' || lang === 'ko') {
      return this.getEntry(this.findPrefixedProperty(property, lang)).pipe(
        switchMap(entry => {
          const result = this.getIndexByNameInEntry(entry, name, lang, flip);
          if (result) {
            return of(result);
          }
          return this.getIndexByName(property, name, 'en', flip);
        })
      );
    }
    return this.getEntry(property).pipe(
      map(entry => {
        return this.getIndexByNameInEntry(entry, name, lang, flip);
      })
    );
  }

  public getSearchIndex<K extends LazyDataI18nKey | 'koItems' | 'zhItems'>(entry: K, additionalProperty?: keyof LazyDataEntries[K]): Observable<{ id: number, name: I18nName }[]> {
    if (!this.searchIndexCache[entry]) {
      this.searchIndexCache[entry] = this.getEntry(entry).pipe(
        map(lazyEntry => {
          return Object.keys(lazyEntry)
            .map(key => {
              return {
                id: +key,
                name: additionalProperty ? lazyEntry[key][additionalProperty] : lazyEntry[key]
              };
            });
        }),
        shareReplay(1)
      );
    }
    return this.searchIndexCache[entry];
  }

  /**
   * PRIVATE HELPERS
   */

  private merge(...dataEntries: I18nElement[]): Record<number, I18nName> {
    return dataEntries.reduce((acc, entry) => {
      Object.keys(entry).forEach((key) => {
        const normalized: I18nName = normalizeI18nName(entry[key]);
        acc[key] = { ...normalized, ...(acc[key] || {}) };
      });
      return acc;
    }, {}) as Record<number, I18nName>;
  }

  private getIndexByNameInEntry(entry: I18nElement, name: string, lang: Language, flip = false): number {
    let keys = Object.keys(entry);
    if (flip) {
      keys = keys.reverse();
    }
    const cleanupRegexp = /[^a-z\s,.]/;
    for (const key of keys) {
      if (!entry[key]) {
        continue;
      }
      const normalizedEntry = normalizeI18nName(entry[key]);
      if (normalizedEntry[lang]?.toString().toLowerCase().replace(cleanupRegexp, '-') === name.toLowerCase().replace(cleanupRegexp, '-')) {
        return +key;
      }
    }
  }

  private findPrefixedProperty(property: LazyDataI18nKey, prefix: 'ko' | 'zh'): LazyDataI18nKey {
    return `${prefix}${property[0].toUpperCase()}${property.slice(1)}` as unknown as LazyDataI18nKey;
  }

  private cacheObservable<T>(observable: Observable<T>, entity: LazyDataKey, id?: number): void {
    const key = entity + (id !== undefined ? `:${id}` : '');
    this.cache[key] = observable.pipe(shareReplay(1));
    setTimeout(() => {
      delete this.cache[key];
    }, LazyDataFacade.CACHE_TTL);
  }

  private getCacheEntry<K extends LazyDataKey>(entity: K): Observable<LazyDataWithExtracts[K]> | null;
  private getCacheEntry<K extends LazyDataKey>(entity: K, id: number): Observable<LazyDataEntries[K]> | null;
  private getCacheEntry<K extends LazyDataKey>(entity: K, id?: number): Observable<LazyDataWithExtracts[K]> | Observable<LazyDataEntries[K]> | null {
    const key = entity + (id !== undefined ? `:${id}` : '');
    return this.cache[key] || null;
  }
}
