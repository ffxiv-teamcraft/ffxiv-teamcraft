import { Pipe, PipeTransform } from '@angular/core';
import { LazyDataService } from '../../core/data/lazy-data.service';

@Pipe({
  name: 'instanceIcon'
})
export class InstanceIconPipe implements PipeTransform {

  constructor(private lazyData: LazyDataService) {
  }

  transform(id: number, fallback?: string): string {
    if (id === 0) {
      return fallback;
    }
    return `https://xivapi.com${this.lazyData.data.instances[id]?.icon}`;
  }

}
