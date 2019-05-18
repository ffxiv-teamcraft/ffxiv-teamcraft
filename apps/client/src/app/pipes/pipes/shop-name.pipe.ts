import { Pipe, PipeTransform } from '@angular/core';
import { I18nName } from '../../model/common/i18n-name';
import { LocalizedDataService } from '../../core/data/localized-data.service';

@Pipe({
  name: 'shopName'
})
export class ShopNamePipe implements PipeTransform {

  constructor(private l12n: LocalizedDataService) {
  }

  transform(name: string): I18nName {
    return this.l12n.getShopName(name) || { en: name, ja: name, de: name, fr: name };
  }

}
