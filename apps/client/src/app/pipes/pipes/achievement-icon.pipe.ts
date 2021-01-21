import { Pipe, PipeTransform } from '@angular/core';
import { LazyDataService } from '../../core/data/lazy-data.service';

@Pipe({
  name: 'achievementIcon'
})
export class AchievementIconPipe implements PipeTransform {

  constructor(private lazyData: LazyDataService) {
  }

  transform(id: number): string {
    return this.lazyData.data.achievements[id]?.icon;
  }

}
