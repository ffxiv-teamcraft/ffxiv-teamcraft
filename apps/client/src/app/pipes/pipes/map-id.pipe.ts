import { Pipe, PipeTransform } from '@angular/core';
import { LocalizedDataService } from '../../core/data/localized-data.service';
import { I18nName } from '../../model/common/i18n-name';

@Pipe({
  name: 'mapId'
})
export class MapIdPipe implements PipeTransform {

  constructor(private data: LocalizedDataService) {
  }

  transform(id: number): number {
    return this.data.getMapId(this.data.getPlace(id).en);
  }

}
