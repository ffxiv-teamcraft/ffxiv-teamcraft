import { Pipe, PipeTransform } from '@angular/core';
import { LocalizedDataService } from '../../core/data/localized-data.service';
import { I18nName } from '../../model/common/i18n-name';

@Pipe({
  name: 'itemName',
  pure: false
})
export class ItemNamePipe implements PipeTransform {

  constructor(private data: LocalizedDataService) {
  }

  transform(id: number, item?: { name: string, custom?: boolean }): I18nName {
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
