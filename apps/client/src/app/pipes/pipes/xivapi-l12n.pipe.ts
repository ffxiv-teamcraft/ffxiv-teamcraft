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
    return this.l12n.xivapiToI18n(value, key, fieldName);
  }
}
