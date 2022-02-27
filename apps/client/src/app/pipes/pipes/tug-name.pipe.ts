import { Pipe, PipeTransform } from '@angular/core';
import { Tug } from '../../core/data/model/tug';

@Pipe({
  name: 'tugName'
})
export class TugNamePipe implements PipeTransform {

  transform(tug: Tug): string | null {
    if (!tug) {
      return null;
    }
    return `DB.FISH.TUG.${['Medium', 'Big', 'Light'][tug]}`;
  }

}
