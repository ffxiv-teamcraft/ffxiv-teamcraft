import { Pipe, PipeTransform } from '@angular/core';
import { I18nToolsService } from '../../core/tools/i18n-tools.service';
import { safeCombineLatest } from '../../core/rxjs/safe-combine-latest';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Pipe({
  name: 'foodBonuses'
})
export class FoodBonusesPipePipe implements PipeTransform {

  constructor(private i18n: I18nToolsService) {
  }

  transform(food: any, compact = false): Observable<string | string[]> {
    return safeCombineLatest(Object.values<any>(food.Bonuses).map((bonus) => {
      return this.i18n.getNameObservable('baseParams', bonus.ID).pipe(
        map(baseParamName => `${baseParamName} +${this.getBonusValueDisplay(bonus, food.HQ)}`)
      );
    })).pipe(
      map(array => {
        if (!compact) {
          return array;
        }
        return array.reduce((acc, row, i) => {
          return `${acc} ${i > 0 ? ',' : ''} ${row}`;
        }, '');
      })
    );
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
