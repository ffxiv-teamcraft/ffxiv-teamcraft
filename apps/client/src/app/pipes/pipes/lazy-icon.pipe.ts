import { Pipe, PipeTransform } from '@angular/core';
import { LazyDataService } from '../../core/data/lazy-data.service';

@Pipe({
  name: 'lazyIcon'
})
export class LazyIconPipe implements PipeTransform {

  constructor(private lazyData: LazyDataService) {
  }

  transform(id: number): string {
    if (!this.lazyData.icons[id] && id.toString().indexOf('draft') > -1) {
      return `http://garlandtools.org/files/icons/item/custom/draft.png`;
    }
    return `https://xivapi.com${this.lazyData.icons[id]}`;
  }

}
