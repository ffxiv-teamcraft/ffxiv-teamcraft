import { Pipe, PipeTransform } from '@angular/core';
import { I18nName } from '../../model/common/i18n-name';
import { LocalizedDataService } from '../../core/data/localized-data.service';

@Pipe({
  name: 'ventureName'
})
export class VentureNamePipe implements PipeTransform {

  constructor(private data: LocalizedDataService) {
  }

  transform(id: number): I18nName {
    return this.data.getVenture(id);
  }

}
