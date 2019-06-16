import { Pipe, PipeTransform } from '@angular/core';
import { LocalizedDataService } from '../../core/data/localized-data.service';

@Pipe({
  name: 'mobName'
})
export class MobNamePipe implements PipeTransform {

  constructor(private data: LocalizedDataService) {
  }

  transform(id: number): any {
    if (id > 1000000) {
      id = id % 1000000;
    }
    return this.data.getMob(id);
  }

}
