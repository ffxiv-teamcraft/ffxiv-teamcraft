import { Pipe, PipeTransform } from '@angular/core';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';
import { LocalizedLazyDataService } from '../../core/data/localized-lazy-data.service';
import { I18nNameLazy } from '../../model/common/i18n-name-lazy';

@Pipe({
  name: 'itemName',
})
export class ItemNamePipe implements PipeTransform {
  constructor(private readonly data: LocalizedLazyDataService) {}

  transform(id: number, item?: { name?: string; custom?: boolean }, fallback?: string): I18nNameLazy {
    if (item && item.custom === true) {
      return {
        de: of(item.name),
        en: of(item.name),
        fr: of(item.name),
        ja: of(item.name),
        ko: of(item.name),
        ru: of(item.name),
        zh: of(item.name),
      };
    }
    const fromData = this.data.getItem(id);
    return {
      de: fromData.de.pipe(map(this.fallbackMapper(fallback))),
      en: fromData.en.pipe(map(this.fallbackMapper(fallback))),
      fr: fromData.fr.pipe(map(this.fallbackMapper(fallback))),
      ja: fromData.ja.pipe(map(this.fallbackMapper(fallback))),
      ko: fromData.ko.pipe(map(this.fallbackMapper(fallback))),
      ru: fromData.ru.pipe(map(this.fallbackMapper(fallback))),
      zh: fromData.zh.pipe(map(this.fallbackMapper(fallback))),
    };
  }

  private readonly fallbackMapper = (fallback?: string) => (val?: string) => val ?? fallback;
}
