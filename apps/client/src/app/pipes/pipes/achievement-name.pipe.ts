import { Pipe, PipeTransform } from '@angular/core';
import { I18nName } from '../../model/common/i18n-name';
import { achievements } from '../../core/data/sources/achievements';

@Pipe({
  name: 'achievementName'
})
export class AchievementNamePipe implements PipeTransform {

  transform(id: number): I18nName {
    return achievements[id];
  }

}
