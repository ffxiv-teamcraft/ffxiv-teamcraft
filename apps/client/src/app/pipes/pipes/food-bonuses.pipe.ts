import { Pipe, PipeTransform } from '@angular/core';
import { LocalizedDataService } from '../../core/data/localized-data.service';
import { I18nToolsService } from '../../core/tools/i18n-tools.service';

@Pipe({
  name: 'foodBonuses'
})
export class FoodBonusesPipePipe implements PipeTransform {

  constructor(private l12n: LocalizedDataService, private i18n: I18nToolsService) {
  }

  transform(food: any, compact = false): string | string[] {
    const array = Object.values<any>(food.Bonuses).map((bonus) => {
      return `${this.i18n.getName(this.l12n.getBaseParamName(bonus.ID))} +${this.getBonusValueDisplay(bonus, food.HQ)}`;
    }, '');
    if (!compact) {
      return array;
    }
    return array.reduce((acc, row, i) => {
      return `${acc} ${i > 0 ? ',' : ''} ${row}`;
    }, '');
  }

  private getBonusValueDisplay(bonus: any, hq: boolean): string {
    if (bonus.Relative) {
      if (hq) {
        return `${bonus.ValueHQ}% (${bonus.MaxHQ})`;
      } else {
        return `${bonus.Value}% (${bonus.Max})`;
      }
    } else {
      if (hq) {
        return `${bonus.ValueHQ}`;
      } else {
        return `${bonus.Value}`;
      }
    }
  }

}
