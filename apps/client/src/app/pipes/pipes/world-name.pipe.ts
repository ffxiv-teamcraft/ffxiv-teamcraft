import { Pipe, PipeTransform } from '@angular/core';
import { LocalizedLazyDataService } from '../../core/data/localized-lazy-data.service';
import { I18nNameLazy } from '../../model/common/i18n-name-lazy';

@Pipe({
  name: 'worldName',
})
export class WorldNamePipe implements PipeTransform {
  constructor(private readonly data: LocalizedLazyDataService) {}

  transform(world: string): I18nNameLazy {
    return this.data.getWorldName(world);
  }
}
