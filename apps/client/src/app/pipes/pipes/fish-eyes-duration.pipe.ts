import { Pipe, PipeTransform } from '@angular/core';
import { fishEyes } from '../../core/data/sources/fish-eyes';

@Pipe({
    name: 'fishEyesDuration',
    standalone: true
})
export class FishEyesDurationPipe implements PipeTransform {

  transform(id: number): number {
    return fishEyes[id];
  }

}
