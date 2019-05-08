import { Pipe, PipeTransform } from '@angular/core';
import { I18nName } from '../../model/common/i18n-name';
import { LocalizedDataService } from '../../core/data/localized-data.service';

@Pipe({
  name: 'mobName'
})
export class MobNamePipe implements PipeTransform {

  constructor(private data: LocalizedDataService) {
  }

  transform(id: number): I18nName {
    return this.data.getMob(id);
  }

}
