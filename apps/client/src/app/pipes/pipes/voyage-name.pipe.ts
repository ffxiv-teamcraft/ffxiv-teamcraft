import { Pipe, PipeTransform } from '@angular/core';
import { LocalizedLazyDataService } from '../../core/data/localized-lazy-data.service';
import { I18nNameLazy } from '../../model/common/i18n-name-lazy';

@Pipe({
  name: 'voyageName'
})
export class VoyageNamePipe implements PipeTransform {
  constructor(private data: LocalizedLazyDataService) {
  }

  transform(id: number, type: number): I18nNameLazy {
    if (type === 0) {
      return this.data.getAirshipVoyageName(id);
    } else if (type === 1) {
      return this.data.getSubmarineVoyageName(id);
    }
  }
}
