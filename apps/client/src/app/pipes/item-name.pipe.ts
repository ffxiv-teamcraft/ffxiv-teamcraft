import { Pipe, PipeTransform } from '@angular/core';
import { LocalizedDataService } from '../core/data/localized-data.service';
import { I18nName } from '../model/common/i18n-name';
import { CustomItem } from '../modules/custom-items/model/custom-item';

@Pipe({
  name: 'itemName',
  pure: false
})
export class ItemNamePipe implements PipeTransform {

  constructor(private data: LocalizedDataService) {
  }

  transform(id: number, item: CustomItem): I18nName {
    if (item && item.custom === true) {
      return {
        fr: item.name,
        en: item.name,
        de: item.name,
        ja: item.name,
        ko: item.name
      };
    }
    return this.data.getItem(id);
  }

}
