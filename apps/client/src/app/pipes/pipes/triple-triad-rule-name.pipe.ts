import { Pipe, PipeTransform } from '@angular/core';
import { I18nName } from '../../model/common/i18n-name';
import { LocalizedDataService } from '../../core/data/localized-data.service';

@Pipe({
  name: 'ttRuleName'
})
export class TripleTriadRuleNamePipe implements PipeTransform {

  constructor(private l12n: LocalizedDataService) {
  }

  transform(id: number): I18nName {
    return this.l12n.getTTRule(id);
  }

}
