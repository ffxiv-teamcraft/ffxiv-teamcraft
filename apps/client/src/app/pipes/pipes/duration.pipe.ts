import { Pipe, PipeTransform } from '@angular/core';
import { formatDistance } from 'date-fns';

@Pipe({
    name: 'duration',
    standalone: true
})
export class DurationPipe implements PipeTransform {
  transform(value: number): string {
    return formatDistance(new Date(), new Date(value));
  }
}
