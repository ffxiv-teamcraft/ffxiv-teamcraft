import { Pipe, PipeTransform } from '@angular/core';
import { LazyDataService } from '../../core/data/lazy-data.service';

@Pipe({
  name: 'actionIcon'
})
export class ActionIconPipe implements PipeTransform {

  constructor(private lazyData: LazyDataService) {
  }

  transform(id: number, fallback?: string): string {
    if (id === -1) {
      return 'assets/icons/remove_final_appraisal.png';
    }
    return this.lazyData.data.actionIcons[id];
  }

}
