import { Pipe, PipeTransform } from '@angular/core';
import { I18nName } from '../../model/common/i18n-name';
import { LazyDataService } from '../../core/data/lazy-data.service';

@Pipe({
  name: 'achievementName'
})
export class AchievementNamePipe implements PipeTransform {

  constructor(private lazyData: LazyDataService) {
  }

  transform(id: number): I18nName {
    return this.lazyData.data.achievements[id];
  }

}
