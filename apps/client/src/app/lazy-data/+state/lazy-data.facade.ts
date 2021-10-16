import { Injectable } from '@angular/core';

import { select, Store } from '@ngrx/store';
import { combineLatest, Observable, of } from 'rxjs';
import { distinctUntilChanged, filter, first, map, shareReplay, switchMap, tap } from 'rxjs/operators';

import * as fromLazyData from './lazy-data.reducer';
import * as LazyDataSelectors from './lazy-data.selectors';
import { loadLazyDataEntityEntry, loadLazyDataFullEntity } from './lazy-data.actions';
import { DataEntryStatus } from '../data-entry-status';
import { LazyDataEntries, LazyDataI18nKey, LazyDataKey, LazyDataWithExtracts, XivapiI18nName } from '../lazy-data-types';
import { I18nName } from '../../model/common/i18n-name';
import { SettingsService } from '../../modules/settings/settings.service';
import { Region } from '../../modules/settings/region.enum';
import { zhWorlds } from '../../core/data/sources/zh-worlds';
import { koWorlds } from '../../core/data/sources/ko-worlds';
import { Craft } from '@ffxiv-teamcraft/simulator';
import { LazyData } from '../../core/data/lazy-data';

@Injectable({
  providedIn: 'root'
})
export class LazyDataFacade {

  private static readonly CACHE_TTL = 30000;

  // This is a temporary cache system to absorb possible call spams on some methods, TTL for each row is 10s toa void memory issues
  private cache: Record<string, Observable<any>> = {};

  constructor(private store: Store<fromLazyData.LazyDataPartialState>,
              private settings: SettingsService) {
  }

  public preloadEntry<K extends LazyDataKey>(propertyKey: K): void {
    this.getStatus(propertyKey).pipe(
      first()
    ).subscribe(({ status }) => {
      if (status !== 'full') {
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
        distinctUntilChanged(([, a], [, b]) => {
          return a.status === b.status;
        }),
        tap(([res, { status }]) => {
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
   */
  public getRow<K extends LazyDataKey>(propertyKey: K, id: number): Observable<LazyDataEntries[K]> {
    if (this.getCacheEntry(propertyKey, id) === null) {
      const obs$ = combineLatest([
        this.store.pipe(select(LazyDataSelectors.getEntryRow, { key: propertyKey, id })),
        this.getStatus(propertyKey)
      ]).pipe(
        distinctUntilChanged(([, a], [, b]) => {
          return a.status === b.status && a.record[id] === b.record[id];
        }),
        tap(([res, { status, record }]) => {
          const loadingOrLoaded = status === 'full' || status === 'loading' || record[id] === 'full' || record[id] === 'loading';
          if (!res && !loadingOrLoaded) {
            this.store.dispatch(loadLazyDataEntityEntry({ entity: propertyKey, id }));
          }
        }),
        map(([res]) => res),
        filter(res => !!res),
        first()
      );
      this.cacheObservable(obs$, propertyKey, id);
    }
    return this.getCacheEntry(propertyKey, id);
  }

  /**
   * Get the status of a lazy data entry in the store
   * @param propertyKey the property to get the status from
   */
  public getStatus<K extends LazyDataKey>(propertyKey: K): Observable<DataEntryStatus> {
    return this.store.pipe(
      select(LazyDataSelectors.getEntryStatus, { key: propertyKey }),
      map(status => status || { status: null, record: {} })
    );
  }

  /**
   * Get I18nName structure for a given row in a given lazy loaded entry
   * @param propertyKey the lazy loaded data entry name
   * @param id the id to get the name for
   * @param extendedProperty if we want to grab data for a sub field (like "description" for instance)
   */
  public getI18nName<K extends LazyDataI18nKey>(propertyKey: K, id: number, extendedProperty?: keyof Extract<LazyDataEntries[K], I18nName>): Observable<I18nName> {
    return this.settings.region$.pipe(
      switchMap(region => {
        return this.getRow(propertyKey, id).pipe(
          map(row => {
            return this.normalizeI18nName(extendedProperty ? row[extendedProperty as string] : row);
          }),
          switchMap(row => {
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

  public getRecipes(): Observable<Craft[]> {
    switch (this.settings.region) {
      case Region.China:
        return this.getEntry('zhRecipes') as unknown as Observable<Craft[]>;
      case Region.Korea:
        return this.getEntry('koRecipes') as unknown as Observable<Craft[]>;
      default:
        return this.getEntry('recipes') as unknown as Observable<Craft[]>;
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

  public getRecipeForItem(id: number | string): Observable<Craft> {
    return this.getRecipes().pipe(
      map(recipes => recipes.find((r) => (r as any).result.toString() === id.toString()))
    );
  }

  public getJobIdByAbbr(abbr: string): Observable<number> {
    return this.getEntry('jobAbbr').pipe(
      map(abbrs => +Object.keys(abbrs).find(key => abbrs[key].en === abbr))
    );
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
