import { Pipe, PipeTransform } from '@angular/core';
import { I18nName } from '../../model/common/i18n-name';
import { LocalizedDataService } from '../../core/data/localized-data.service';

@Pipe({
  name: 'questName',
  pure: true
})
export class QuestNamePipe implements PipeTransform {

  constructor(private l12n: LocalizedDataService) {
  }

  transform(id: number): I18nName {
    if (this.l12n.getQuest(id) === undefined) {
      return {
        en: '',
        ja: '',
        de: '',
        fr: ''
      };
    }
    return this.l12n.getQuest(id).name;
  }

}
