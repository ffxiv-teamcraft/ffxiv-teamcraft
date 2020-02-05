import { Pipe, PipeTransform } from '@angular/core';
import { LocalizedDataService } from '../../core/data/localized-data.service';
import { I18nToolsService } from '../../core/tools/i18n-tools.service';

@Pipe({
  name: 'foodBonuses'
})
export class FoodBonusesPipePipe implements PipeTransform {

  constructor(private l12n: LocalizedDataService, private i18n: I18nToolsService) {
  }

  transform(food: any): string {
    return food.Bonuses.map(bonus => {

    });
  }

}
