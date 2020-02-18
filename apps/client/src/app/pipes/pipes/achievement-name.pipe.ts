import { Pipe, PipeTransform } from '@angular/core';
import { I18nName } from '../../model/common/i18n-name';
import { LocalizedDataService } from '../../core/data/localized-data.service';

@Pipe({
  name: 'achievementName'
})
export class AchievementNamePipe implements PipeTransform {

  constructor(private i18n: LocalizedDataService) {
  }

  transform(id: number): I18nName {
    return this.i18n.getAchievementName(id);
  }

}
