import { Pipe, PipeTransform } from '@angular/core';
import { LocalizedDataService } from '../../core/data/localized-data.service';
import { I18nName } from '../../model/common/i18n-name';

@Pipe({
  name: 'itemName'
})
export class ItemNamePipe implements PipeTransform {

  constructor(private data: LocalizedDataService) {
  }

  transform(id: number, item?: { name?: string, custom?: boolean }, fallback?: string): I18nName {
    if (item && item.custom === true) {
      return {
        fr: item.name,
        en: item.name,
        de: item.name,
        ja: item.name,
        ko: item.name
      };
    }
    const fromData = this.data.getItem(id);
    return fromData || {
      fr: fallback,
      en: fallback,
      de: fallback,
      ja: fallback,
      ko: fallback
    }
  }

}
