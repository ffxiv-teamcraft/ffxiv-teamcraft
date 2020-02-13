import { Pipe, PipeTransform } from '@angular/core';
import { LocalizedDataService } from '../../core/data/localized-data.service';
import { I18nName } from '../../model/common/i18n-name';

@Pipe({
  name: 'tribeName'
})
export class TribeNamePipe implements PipeTransform {

  constructor(private l12n: LocalizedDataService) {
  }

  transform(id: number, fallback?: string): I18nName {
    return this.l12n.getTribeName(id);
  }

}
