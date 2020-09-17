import { Pipe, PipeTransform } from '@angular/core';
import { LocalizedLazyDataService } from '../../core/data/localized-lazy-data.service';
import { I18nNameLazy } from '../../model/common/i18n-name-lazy';

@Pipe({
  name: 'mobName',
})
export class MobNamePipe implements PipeTransform {
  constructor(private data: LocalizedLazyDataService) {}

  transform(id: number): I18nNameLazy {
    if (id > 1000000) {
      id = id % 1000000;
    }
    return this.data.getMob(id);
  }
}
