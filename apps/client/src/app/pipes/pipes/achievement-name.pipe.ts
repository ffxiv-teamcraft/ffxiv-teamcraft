import { Pipe, PipeTransform } from '@angular/core';
import { LocalizedLazyDataService } from '../../core/data/localized-lazy-data.service';
import { I18nNameLazy } from '../../model/common/i18n-name-lazy';

@Pipe({
  name: 'achievementName',
})
export class AchievementNamePipe implements PipeTransform {
  constructor(private i18n: LocalizedLazyDataService) {}

  transform(id: number): I18nNameLazy {
    return this.i18n.getAchievementName(id);
  }
}
