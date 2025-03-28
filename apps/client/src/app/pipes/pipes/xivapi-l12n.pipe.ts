import { Pipe, PipeTransform } from '@angular/core';
import { I18nName } from '@ffxiv-teamcraft/types';
import { I18nToolsService } from '../../core/tools/i18n-tools.service';

@Pipe({
    name: 'xivapiL12n',
    standalone: true
})
export class XivapiL12nPipe implements PipeTransform {

  constructor(private i18n: I18nToolsService) {
  }

  transform(value: any, key: any, fieldName = 'Name'): I18nName {
    return this.i18n.xivapiToI18n(value, fieldName);
  }
}
