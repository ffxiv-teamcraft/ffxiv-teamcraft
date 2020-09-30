import { Pipe, PipeTransform } from '@angular/core';

import { LocalizedLazyDataService } from '../../core/data/localized-lazy-data.service';

@Pipe({
  name: 'mobName'
})
export class MobNamePipe implements PipeTransform {
  public static getActualMobId(id: number) {
    if (id > 1000000) {
      id = id % 1000000;
    }
    return id;
  }
  constructor(private data: LocalizedLazyDataService) {
  }

  transform(id: number): any {
    id = MobNamePipe.getActualMobId(id);
    return this.data.getMob(id);
  }

}
