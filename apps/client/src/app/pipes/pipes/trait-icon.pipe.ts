import { Pipe, PipeTransform } from '@angular/core';
import { LocalizedDataService } from '../../core/data/localized-data.service';
import { I18nName } from '../../model/common/i18n-name';

@Pipe({
  name: 'traitIcon'
})
export class TraitIconPipe implements PipeTransform {

  constructor(private l12n: LocalizedDataService) {
  }

  transform(id: number, fallback?: string): string {
    return this.l12n.getTrait(id).icon;
  }

}
