import { Pipe, PipeTransform } from '@angular/core';
import { LazyDataEntries } from '../../lazy-data/lazy-data-types';
import { I18nName, LazyDataI18nKey } from '@ffxiv-teamcraft/types';
import { LazyDataFacade } from '../../lazy-data/+state/lazy-data.facade';
import { Observable } from 'rxjs';

@Pipe({
  name: 'i18nRow'
})
export class I18nRowPipe implements PipeTransform {

  constructor(private lazyData: LazyDataFacade) {
  }

  transform<K extends LazyDataI18nKey>(value: number, contentName: K, extendedProperty?: string): Observable<I18nName> {
    // We're going to assume the second param is keyof Extract<LazyDataEntries[K], I18nName> since angular is too stupid to udnerstand it in templates
    return this.lazyData.getI18nName(contentName, value, extendedProperty as keyof Extract<LazyDataEntries[K], I18nName>);
  }

}
