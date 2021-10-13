import { Injectable } from '@angular/core';

import { select, Store } from '@ngrx/store';
import { combineLatest, Observable, of } from 'rxjs';
import { filter, map, switchMap, tap } from 'rxjs/operators';

import * as fromLazyData from './lazy-data.reducer';
import * as LazyDataSelectors from './lazy-data.selectors';
import { loadLazyDataEntityEntry, loadLazyDataFullEntity } from './lazy-data.actions';
import { DataEntryStatus } from '../data-entry-status';
import { LazyDataEntries, LazyDataI18nEntries, LazyDataKey, LazyDataWithExtracts, XivapiI18nName } from '../lazy-data-types';
import { I18nName } from '../../model/common/i18n-name';
import { SettingsService } from '../../modules/settings/settings.service';
import { Region } from '../../modules/settings/region.enum';
import { zhWorlds } from '../../core/data/sources/zh-worlds';
import { koWorlds } from '../../core/data/sources/ko-worlds';

@Injectable({
  providedIn: 'root'
})
export class LazyDataFacade {
  constructor(private store: Store<fromLazyData.LazyDataPartialState>,
              private settings: SettingsService) {
  }

  /**
   * Gets an entire file worth of data at once.
   * @param propertyKey the name of the property you want to load inside the lazy data system.
   */
  public getEntry<K extends LazyDataKey>(propertyKey: K): Observable<LazyDataWithExtracts[K]> {
    return combineLatest([
      this.store.pipe(select(LazyDataSelectors.getEntry, { key: propertyKey })),
      this.getStatus(propertyKey)
    ]).pipe(
      tap(([res, { status }]) => {
        const loadingOrLoaded = status === 'full' || status === 'loading';
        if (!res && !loadingOrLoaded) {
          this.store.dispatch(loadLazyDataFullEntity({ entity: propertyKey }));
        }
      }),
      map(([res]) => res),
      filter(res => !!res)
    );
  }

  /**
   * Gets a single entry of a given property
   * @param propertyKey the name of the property to get the id from
   * @param id the id of the row you want to load
   */
  public getRow<K extends LazyDataKey>(propertyKey: K, id: number): Observable<LazyDataEntries[K]> {
    return combineLatest([
      this.store.pipe(select(LazyDataSelectors.getEntryRow, { key: propertyKey, id })),
      this.getStatus(propertyKey)
    ]).pipe(
      tap(([res, { status, record }]) => {
        const loadingOrLoaded = status === 'full' || status === 'loading' || record[id] === 'full' || record[id] === 'loading';
        if (!res && !loadingOrLoaded) {
          this.store.dispatch(loadLazyDataEntityEntry({ entity: propertyKey, id }));
        }
      }),
      map(([res]) => res),
      filter(res => !!res)
    );
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
  public getI18nName<K extends keyof LazyDataI18nEntries>(propertyKey: K, id: number, extendedProperty?: keyof Extract<LazyDataEntries[K], I18nName>): Observable<I18nName> {
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

  private findPrefixedProperty(property: keyof LazyDataI18nEntries, prefix: 'ko' | 'zh'): keyof LazyDataI18nEntries {
    return `${prefix}${property[0].toUpperCase()}${property.slice(1)}` as keyof LazyDataI18nEntries;
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
}
