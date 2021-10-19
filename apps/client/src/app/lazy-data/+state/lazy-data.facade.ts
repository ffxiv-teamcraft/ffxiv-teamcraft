import { Injectable } from '@angular/core';

import { select, Store } from '@ngrx/store';
import { combineLatest, Observable, of } from 'rxjs';
import { distinctUntilChanged, filter, first, map, shareReplay, switchMap, tap } from 'rxjs/operators';

import * as fromLazyData from './lazy-data.reducer';
import * as LazyDataSelectors from './lazy-data.selectors';
import { loadLazyDataEntityEntry, loadLazyDataFullEntity } from './lazy-data.actions';
import { LazyDataEntries, LazyDataI18nKey, LazyDataKey, LazyDataRecordKey, LazyDataWithExtracts, XivapiI18nName } from '../lazy-data-types';
import { I18nName } from '../../model/common/i18n-name';
import { SettingsService } from '../../modules/settings/settings.service';
import { Region } from '../../modules/settings/region.enum';
import { zhWorlds } from '../../core/data/sources/zh-worlds';
import { koWorlds } from '../../core/data/sources/ko-worlds';
import { LazyData } from '../../core/data/lazy-data';
import { LoadingStatus } from '../data-entry-status';
import { LazyRecipe } from '../model/lazy-recipe';
import { XivapiPatch } from '../../core/data/model/xivapi-patch';
import { HttpClient } from '@angular/common/http';
import { mapIds } from '../../core/data/sources/map-ids';

@Injectable({
  providedIn: 'root'
})
export class LazyDataFacade {

  private static readonly CACHE_TTL = 30000;

  // This is a temporary cache system to absorb possible call spams on some methods, TTL for each row is 10s toa void memory issues
  private cache: Record<string, Observable<any>> = {};

  public isLoading$ = this.store.pipe(
    select(LazyDataSelectors.isLoading)
  );

  public patches$ = this.http.get<XivapiPatch[]>('https://xivapi.com/patchlist').pipe(
    shareReplay(1)
  );

  constructor(private store: Store<fromLazyData.LazyDataPartialState>,
              private settings: SettingsService, private http: HttpClient) {
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
        this.store.pipe(select(LazyDataSelectors.getEntry, { key: propertyKey })),
        this.getStatus(propertyKey)
      ]).pipe(
        tap(([res, status]) => {
          const loadingOrLoaded = status === 'full' || status === 'loading';
          if (!res && !loadingOrLoaded) {
            this.store.dispatch(loadLazyDataFullEntity({ entity: propertyKey }));
          }
        }),
        map(([res]) => res),
        filter(res => !!res),
        first()
      );
      this.cacheObservable(obs$, propertyKey);
    }
    return this.getCacheEntry(propertyKey);
  }

  /**
   * Gets a single entry of a given property
   * @param propertyKey the name of the property to get the id from
   * @param id the id of the row you want to load
   * @param fallback fallback value if nothing is found
   */
  public getRow<K extends LazyDataRecordKey>(propertyKey: K, id: number, fallback?: LazyDataEntries[K]): Observable<LazyDataEntries[K]> {
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
        map(([res, status]) => {
          if (status === 'full' && !res) {
            return fallback;
          } else if (res) {
            return res;
          }
          return undefined;
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
    return this.settings.region$.pipe(
      switchMap(region => {
        return this.getRow(propertyKey, id).pipe(
          map(row => {
            if (!row) {
              return null;
            }
            return this.normalizeI18nName(extendedProperty ? row[extendedProperty as string] : row);
          }),
          switchMap(row => {
            if (!row) {
              return of(null);
            }
            switch (region) {
              case Region.Global:
                return of(row);
              case Region.China:
                return this.getRow(this.findPrefixedProperty(propertyKey, 'zh'), id).pipe(
                  map(zhRow => {
                    return {
                      ...row,
                      ...this.normalizeI18nName(extendedProperty ? row[extendedProperty as string] : zhRow)
                    };
                  })
                );
              case Region.Korea:
                return this.getRow(this.findPrefixedProperty(propertyKey, 'ko'), id).pipe(
                  map(koRow => {
                    return {
                      ...row,
                      ...this.normalizeI18nName(extendedProperty ? row[extendedProperty as string] : koRow)
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

  public getWorldName(world: string): Observable<I18nName> {
    return of({
      fr: world,
      en: world,
      de: world,
      ja: world,
      zh: zhWorlds[world] ?? world,
      ko: koWorlds[world] ?? world,
      ru: world
    });
  }

  public getRecipes(): Observable<LazyRecipe[]> {
    switch (this.settings.region) {
      case Region.China:
        return this.getEntry('zhRecipes');
      case Region.Korea:
        return this.getEntry('koRecipes');
      default:
        return this.getEntry('recipes');
    }
  }

  public getMinBtnSpearNodesIndex(): Observable<(Omit<LazyDataEntries['nodes'], 'zoneid'> & { id: number, zoneId: number })[]> {
    return this.getEntry('nodes').pipe(
      map(nodes => {
        return Object.entries<LazyData['nodes']>(nodes)
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
      shareReplay(1)
    );
  }

  public getRecipeForItem(id: number | string): Observable<LazyRecipe> {
    return this.getRecipes().pipe(
      map(recipes => recipes.find((r) => (r as any).result.toString() === id.toString()))
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

  /**
   * PRIVATE HELPERS
   */

  private findPrefixedProperty(property: LazyDataI18nKey, prefix: 'ko' | 'zh'): LazyDataI18nKey {
    return `${prefix}${property[0].toUpperCase()}${property.slice(1)}` as LazyDataI18nKey;
  }

  private normalizeI18nName(row: I18nName | { name: I18nName } | XivapiI18nName): I18nName {
    if ((row as I18nName).en !== undefined || (row as I18nName).zh !== undefined || (row as I18nName).ko !== undefined) {
      return row as I18nName;
    }
    if ((row as { name: I18nName }).name) {
      return (row as { name: I18nName }).name;
    }
    if ((row as XivapiI18nName).Name_en) {
      return {
        en: (row as XivapiI18nName).Name_en,
        ja: (row as XivapiI18nName).Name_ja,
        de: (row as XivapiI18nName).Name_de,
        fr: (row as XivapiI18nName).Name_fr
      };
    }
    throw new Error(`Trying to normalize something that's not an i18n name: ${JSON.stringify(row)}`);
  }

  private cacheObservable<T>(observable: Observable<T>, entity: LazyDataKey, id?: number): void {
    const key = entity + (id ? `:${id}` : '');
    this.cache[key] = observable.pipe(shareReplay(1));
    setTimeout(() => {
      delete this.cache[key];
    }, LazyDataFacade.CACHE_TTL);
  }

  private getCacheEntry<K extends LazyDataKey>(entity: K): Observable<LazyDataWithExtracts[K]> | null;
  private getCacheEntry<K extends LazyDataKey>(entity: K, id: number): Observable<LazyDataEntries[K]> | null;
  private getCacheEntry<K extends LazyDataKey>(entity: K, id?: number): Observable<LazyDataWithExtracts[K]> | Observable<LazyDataEntries[K]> | null {
    const key = entity + (id ? `:${id}` : '');
    return this.cache[key] || null;
  }
}
