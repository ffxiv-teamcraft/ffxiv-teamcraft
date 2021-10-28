import { Pipe, PipeTransform } from '@angular/core';
import { Observable, of } from 'rxjs';
import { LazyDataFacade } from '../../lazy-data/+state/lazy-data.facade';
import { I18nName } from '../../model/common/i18n-name';

@Pipe({
  name: 'itemName'
})
export class ItemNamePipe implements PipeTransform {
  constructor(private readonly lazyData: LazyDataFacade) {
  }

  transform(id: number, item?: { name?: string; custom?: boolean }, fallback?: string): Observable<I18nName> {
    if (item && item.custom === true) {
      return of({
        de: item.name,
        en: item.name,
        fr: item.name,
        ja: item.name,
        ko: item.name,
        ru: item.name,
        zh: item.name
      });
    }
    return this.lazyData.getI18nName('items', id);
  }
}
