import { Pipe, PipeTransform } from '@angular/core';
import { achievementIcons } from '../../core/data/sources/achievement-icons';

@Pipe({
  name: 'achievementIcon'
})
export class AchievementIconPipe implements PipeTransform {

  transform(id: number): string {
    return achievementIcons[id];
  }

}
