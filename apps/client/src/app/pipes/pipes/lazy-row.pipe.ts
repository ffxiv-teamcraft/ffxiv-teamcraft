import { Pipe, PipeTransform } from '@angular/core';
import { Observable } from 'rxjs';
import { map, startWith, switchMap } from 'rxjs/operators';
import { LazyDataFacade } from '../../lazy-data/+state/lazy-data.facade';
import { LazyDataEntries, LazyDataRecordKey } from '../../lazy-data/lazy-data-types';
import { LazyDataKeys } from '../../lazy-data/lazy-data-keys';
import { TranslateService } from '@ngx-translate/core';
import { Language } from '../../core/data/language';

@Pipe({
  name: 'lazyRow'
})
export class LazyRowPipe implements PipeTransform {

  constructor(private lazyData: LazyDataFacade, private translate: TranslateService) {
  }

  transform<K extends LazyDataRecordKey, F extends keyof LazyDataEntries[K]>(id: number, entry: K): Observable<LazyDataEntries[K]>
  transform<K extends LazyDataRecordKey, F extends keyof LazyDataEntries[K]>(id: number, entry: K, field: F): Observable<LazyDataEntries[K][F]>
  transform<K extends LazyDataRecordKey, F extends keyof LazyDataEntries[K]>(id: number, entry: K, field?: F): Observable<LazyDataEntries[K] | LazyDataEntries[K][F]> {
    return this.translate.onLangChange.pipe(
      map(change => change.lang),
      startWith(this.translate.currentLang),
      switchMap((lang: Language) => {
        if (['zh', 'ko'].includes(lang)) {
          const externalKey = `${lang}${entry[0].toUpperCase()}${entry.slice(1)}`;
          if (LazyDataKeys.includes(externalKey)) {
            return this.lazyData.getRow(externalKey as K, id).pipe(
              map(row => field && row ? row[field] : row)
            );
          }
        }
        return this.lazyData.getRow(entry, id).pipe(
          map(row => field && row ? row[field] : row)
        );
      })
    );
  }

}
