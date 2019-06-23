import { Pipe, PipeTransform } from '@angular/core';
import { I18nToolsService } from './tools/i18n-tools.service';

@Pipe({
  name: 'i18n',
  pure: false
})
export class I18nPipe implements PipeTransform {

  constructor(private i18n: I18nToolsService) {
  }

  transform(value: any): string {
    if (value === undefined) {
      return undefined;
    }
    let res: string;
    if (this.isI18nEntry(value.name)) {
      res = this.i18n.getName(value.name);
    } else if (this.isI18nEntry(value)) {
      res = this.i18n.getName(value);
    } else {
      res = value.name;
    }
    return res && (res.charAt(0).toUpperCase() + res.slice(1));
  }

  isI18nEntry(data: any): boolean {
    return data !== undefined &&
      data.en !== undefined
      && data.de !== undefined
      && data.ja !== undefined
      && data.fr !== undefined;
  }

}
