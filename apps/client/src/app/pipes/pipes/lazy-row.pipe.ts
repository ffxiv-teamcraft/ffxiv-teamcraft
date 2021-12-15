import { Pipe, PipeTransform } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { LazyDataFacade } from '../../lazy-data/+state/lazy-data.facade';
import { LazyDataEntries, LazyDataRecordKey } from '../../lazy-data/lazy-data-types';

@Pipe({
  name: 'lazyRow'
})
export class LazyRowPipe implements PipeTransform {

  constructor(private lazyData: LazyDataFacade) {
  }

  transform<K extends LazyDataRecordKey, F extends keyof LazyDataEntries[K]>(id: number, entry: K): Observable<LazyDataEntries[K]>
  transform<K extends LazyDataRecordKey, F extends keyof LazyDataEntries[K]>(id: number, entry: K, field: F): Observable<LazyDataEntries[K][F]>
  transform<K extends LazyDataRecordKey, F extends keyof LazyDataEntries[K]>(id: number, entry: K, field?: F): Observable<LazyDataEntries[K] | LazyDataEntries[K][F]> {
    return this.lazyData.getRow(entry, id).pipe(
      map(row => field ? row[field] : row)
    );
  }

}
