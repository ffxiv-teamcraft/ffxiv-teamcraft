import { Pipe, PipeTransform } from '@angular/core';
import { I18nToolsService } from './tools/i18n-tools.service';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
  name: 'i18n',
  pure: false
})
export class I18nPipe implements PipeTransform {

  private cache: { input: any, lang: string, value: string };

  constructor(private i18n: I18nToolsService, private translate: TranslateService) {
  }

  transform(value: any): string {
    if (this.cache === undefined
      || this.cache.input !== value
      || this.cache.lang !== this.translate.currentLang) {
      if (!value) {
        return value;
      }
      let res: string;
      if (this.isI18nEntry(value.name)) {
        res = this.i18n.getName(value.name);
      } else if (this.isI18nEntry(value)) {
        res = this.i18n.getName(value);
      } else {
        res = value.name;
      }
      this.cache = {
        input: value,
        value: res && (res.charAt(0).toUpperCase() + res.slice(1)),
        lang: this.translate.currentLang
      };
    }
    return this.cache.value;
  }

  isI18nEntry(data: any): boolean {
    return data !== undefined &&
      data.en !== undefined
      && data.de !== undefined
      && data.ja !== undefined
      && data.fr !== undefined;
  }

}
