import { Pipe, PipeTransform } from '@angular/core';
import { Tug } from '../../core/data/model/tug';

@Pipe({
  name: 'tugName'
})
export class TugNamePipe implements PipeTransform {

  transform(tug: Tug): string {
    return `DB.FISH.TUG.${['Medium', 'Big', 'Light'][tug]}`;
  }

}
