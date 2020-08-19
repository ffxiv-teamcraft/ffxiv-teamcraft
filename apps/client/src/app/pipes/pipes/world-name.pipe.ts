import { Pipe, PipeTransform } from '@angular/core';
import { LocalizedDataService } from '../../core/data/localized-data.service';
import { I18nName } from '../../model/common/i18n-name';

@Pipe({
  name: 'worldName'
})
export class WorldNamePipe implements PipeTransform {

  constructor(private data: LocalizedDataService) {
  }

  transform(world: string): I18nName {
    console.log('world', world)
    return this.data.getWorldName(world);
  }

}
