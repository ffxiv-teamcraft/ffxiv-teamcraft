import { Pipe, PipeTransform } from '@angular/core';
import { LocalizedLazyDataService } from '../../core/data/localized-lazy-data.service';
import { I18nNameLazy, i18nToLazy } from '../../model/common/i18n-name-lazy';
import { I18nName } from '../../model/common/i18n-name';

@Pipe({
  name: 'shopName'
})
export class ShopNamePipe implements PipeTransform {
  constructor(private readonly l12n: LocalizedLazyDataService) {
  }

  transform(name: string | I18nName): I18nNameLazy {
    if (typeof name === 'string') {
      return this.l12n.getShopName(name);
    } else {
      return i18nToLazy(name);
    }
  }
}
