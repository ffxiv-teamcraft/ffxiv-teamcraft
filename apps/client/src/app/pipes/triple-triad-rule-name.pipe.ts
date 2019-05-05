import { Pipe, PipeTransform } from '@angular/core';
import { I18nName } from '../model/common/i18n-name';
import { tripleTriadRules } from '../core/data/sources/triple-triad-rules';

@Pipe({
  name: 'ttRuleName'
})
export class TripleTriadRuleNamePipe implements PipeTransform {

  constructor() {
  }

  transform(id: number): I18nName {
    return tripleTriadRules[id].name;
  }

}
