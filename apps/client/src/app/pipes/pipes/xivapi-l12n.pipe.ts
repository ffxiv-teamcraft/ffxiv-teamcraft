import { Pipe, PipeTransform } from '@angular/core';
import { LocalizedDataService } from '../../core/data/localized-data.service';
import { I18nName } from '../../model/common/i18n-name';

@Pipe({
  name: 'xivapiL12n'
})
export class XivapiL12nPipe implements PipeTransform {

  constructor(private l12n: LocalizedDataService) {
  }

  transform(value: any, key: any, fieldName = 'Name'): I18nName {
    const row = {
      en: value[`${fieldName}_en`],
      fr: value[`${fieldName}_fr`],
      de: value[`${fieldName}_de`],
      ja: value[`${fieldName}_ja`],
    };
    
    this.l12n.tryFillExtendedLanguage(row, value.ID, this.l12n.guessExtendedLanguageKeys(key));
    return row;
  }
}
