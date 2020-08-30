import { Pipe, PipeTransform } from '@angular/core';
import { LocalizedLazyDataService } from '../../core/data/localized-lazy-data.service';
import { I18nNameLazy } from '../../model/common/i18n-name-lazy';

@Pipe({
  name: 'freeCompanyActionName',
})
export class FreeCompanyActionNamePipe implements PipeTransform {
  constructor(private data: LocalizedLazyDataService) {}

  transform(id: number): I18nNameLazy {
    return this.data.getFreeCompanyAction(id);
  }
}
