import { Pipe, PipeTransform } from '@angular/core';
import { LazyDataService } from '../../core/data/lazy-data.service';

@Pipe({
  name: 'lazyIcon'
})
export class LazyIconPipe implements PipeTransform {

  constructor(private lazyData: LazyDataService) {
  }

  transform(id: number): string {
    if (!this.lazyData.data.itemIcons[id] && id.toString().indexOf('draft') > -1) {
      return `https://garlandtools.org/files/icons/item/custom/draft.png`;
    }
    return `https://xivapi.com${this.lazyData.data.itemIcons[id]}`;
  }

}
