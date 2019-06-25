import { Pipe, PipeTransform } from '@angular/core';
import { LocalizedDataService } from '../../core/data/localized-data.service';

@Pipe({
  name: 'questIcon',
  pure: true
})
export class QuestIconPipe implements PipeTransform {

  constructor(private l12n: LocalizedDataService) {
  }

  transform(id: number): string {
    return this.l12n.getQuest(id).icon;
  }

}
