import { Pipe, PipeTransform } from '@angular/core';
import { LazyDataService } from '../../core/data/lazy-data.service';

@Pipe({
  name: 'lazyIcon'
})
export class LazyIconPipe implements PipeTransform {

  constructor(private lazyData: LazyDataService) {
  }

  transform(id: number): string {
    return `https://xivapi.com${this.lazyData.icons[id]}`;
  }

}
