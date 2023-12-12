import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'absolute',
    standalone: true
})
export class AbsolutePipe implements PipeTransform {

  transform(value: number): number {
    return Math.abs(value);
  }

}
