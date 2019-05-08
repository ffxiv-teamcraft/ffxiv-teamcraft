import { Pipe, PipeTransform } from '@angular/core';
import { I18nName } from '../../model/common/i18n-name';

@Pipe({
  name: 'ffxivgardening'
})
export class FfxivgardeningPipe implements PipeTransform {

  transform(id: number): I18nName {
    return {
      en: `http://www.ffxivgardening.com/seed-details.php?SeedID=${id}`,
      fr: `http://fr.ffxivgardening.com/seed-details.php?SeedID=${id}`,
      de: `http://de.ffxivgardening.com/seed-details.php?SeedID=${id}`,
      ja: `http://ja.ffxivgardening.com/seed-details.php?SeedID=${id}`,
      ko: `http://ko.ffxivgardening.com/seed-details.php?SeedID=${id}`,
      zh: `http://zh.ffxivgardening.com/seed-details.php?SeedID=${id}`
    };
  }

}
