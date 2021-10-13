import { Pipe, PipeTransform } from '@angular/core';
import { LazyDataI18nEntries } from '../../lazy-data/lazy-data-types';
import { I18nName } from '../../model/common/i18n-name';
import { LazyDataFacade } from '../../lazy-data/+state/lazy-data.facade';
import { Observable } from 'rxjs';

@Pipe({
  name: 'i18nRow'
})
export class I18nRowPipe implements PipeTransform {

  constructor(private lazyData: LazyDataFacade) {
  }

  transform(value: number, contentName: keyof LazyDataI18nEntries): Observable<I18nName> {
    return this.lazyData.getI18nName(contentName, value);
  }

}
