import { Pipe, PipeTransform } from '@angular/core';
import { LazyDataService } from '../../core/data/lazy-data.service';

@Pipe({
  name: 'lazyIcon'
})
export class LazyIconPipe implements PipeTransform {

  constructor(private lazyData: LazyDataService) {
  }

  transform(id: number): string {
    const icon = this.lazyData.icons[id];
    if (icon === undefined) {
      console.log(id);
    }
    return `https://xivapi.com${this.lazyData.icons[id]}`;
  }

}
