import { Pipe, PipeTransform } from '@angular/core';
import { I18nName } from '../../model/common/i18n-name';
import { LazyDataFacade } from '../../lazy-data/+state/lazy-data.facade';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Pipe({
  name: 'shopName'
})
export class ShopNamePipe implements PipeTransform {
  constructor(private readonly lazyData: LazyDataFacade) {
  }

  transform(name: string | I18nName): Observable<I18nName> {
    if (typeof name === 'string') {
      return this.lazyData.getEntry('shops').pipe(
        switchMap(shops => {
          const id = +Object.keys(shops).find((k) => shops[k].en === name);
          return this.lazyData.getI18nName('shops', id);
        })
      );
    } else {
      return of(name);
    }
  }
}
