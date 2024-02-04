import { Pipe, PipeTransform } from '@angular/core';


@Pipe({
  name: 'hourDisplay',
  pure: true,
  standalone: true
})
export class HourDisplayPipe implements PipeTransform{
  transform(value: number): string {
    const decimalPart = Math.floor(value % 1 * 60);
    const intPart = Math.floor(value)
    return `${intPart}:${decimalPart.toString().padStart(2, '0')}`
  }

}
