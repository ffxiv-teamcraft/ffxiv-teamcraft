import { Pipe, PipeTransform } from '@angular/core';
import { I18nName } from '@ffxiv-teamcraft/types';

@Pipe({
  name: 'ffxivgardening'
})
export class FfxivgardeningPipe implements PipeTransform {

  transform(id: number): I18nName {
    return {
      en: `http://www.ffxivgardening.com/seed-details.php?SeedID=${id}`,
      fr: `http://www.ffxivgardening.com/seed-details.php?SeedID=${id}&lang=fr_FR`,
      de: `http://www.ffxivgardening.com/seed-details.php?SeedID=${id}&lang=de_DE`,
      ja: `http://www.ffxivgardening.com/seed-details.php?SeedID=${id}&lang=ja_JP.UTF-8`,
      ko: `http://www.ffxivgardening.com/seed-details.php?SeedID=${id}&lang=ko_KR.UTF-8`,
      zh: `http://www.ffxivgardening.com/seed-details.php?SeedID=${id}&lang=zh_CN`
    };
  }

}
