import { Pipe, PipeTransform } from '@angular/core';
import { distanceInWords } from 'date-fns';

@Pipe({
  name: 'duration'
})
export class DurationPipe implements PipeTransform {

  transform(value: number): string {
    return distanceInWords(new Date(), new Date(value));
  }

}
