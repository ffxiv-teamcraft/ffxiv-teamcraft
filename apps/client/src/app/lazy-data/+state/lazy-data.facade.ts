import { Injectable } from '@angular/core';

import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { filter, tap } from 'rxjs/operators';

import * as fromLazyData from './lazy-data.reducer';
import * as LazyDataSelectors from './lazy-data.selectors';
import { loadLazyDataEntityEntry, loadLazyDataFullEntity } from './lazy-data.actions';
import { DataEntryStatus } from '../data-entry-status';
import { LazyDataEntryElement, LazyDataKey, LazyDataWithExtracts } from '../lazy-data-key';

@Injectable()
export class LazyDataFacade {
  constructor(private store: Store<fromLazyData.LazyDataPartialState>) {
  }

  /**
   * Gets an entire file worth of data at once.
   * @param propertyKey the name of the property you want to load inside the lazy data system.
   */
  public getEntry<K extends LazyDataKey>(propertyKey: K): Observable<LazyDataWithExtracts[K]> {
    return this.store.select(LazyDataSelectors.getEntry, { key: propertyKey }).pipe(
      tap(res => {
        if (!res) {
          this.store.dispatch(loadLazyDataFullEntity({ entity: propertyKey }));
        }
      }),
      filter(res => !!res)
    );
  }

  /**
   * Gets a single entry of a given property
   * @param propertyKey the name of the property to get the id from
   * @param id the id of the row you want to load
   */
  public getRow<K extends LazyDataKey>(propertyKey: K, id: number): Observable<LazyDataEntryElement<K>> {
    return this.store.select(LazyDataSelectors.getEntryRow, { key: propertyKey, id }).pipe(
      tap(res => {
        if (!res) {
          this.store.dispatch(loadLazyDataEntityEntry({ entity: propertyKey, id }));
        }
      }),
      filter(res => !!res)
    );
  }

  /**
   * Get the status of a lazy data entry in the store
   * @param propertyKey the property to get the status from
   */
  public getStatus<K extends LazyDataKey>(propertyKey: K): Observable<DataEntryStatus> {
    return this.store.select(LazyDataSelectors.getEntryStatus, { key: propertyKey });
  }
}
