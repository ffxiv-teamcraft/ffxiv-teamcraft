import { Pipe, PipeTransform } from '@angular/core';
import { LazyDataService } from '../../core/data/lazy-data.service';

@Pipe({
  name: 'ilvl'
})
export class IlvlPipe implements PipeTransform {

  constructor(private lazyData: LazyDataService) {
  }

  transform(id: number): number {
    return this.lazyData.data.ilvls[id];
  }

}
