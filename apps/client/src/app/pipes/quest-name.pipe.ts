import { Pipe, PipeTransform } from '@angular/core';
import { I18nName } from '../model/common/i18n-name';
import { LazyDataService } from '../core/data/lazy-data.service';

@Pipe({
  name: 'questName',
  pure: true
})
export class QuestNamePipe implements PipeTransform {

  constructor(private lazyData: LazyDataService) {
  }

  transform(id: number): I18nName {
    return this.lazyData.quests[id].name;
  }

}
