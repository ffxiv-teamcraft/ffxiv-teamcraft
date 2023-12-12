import { Pipe, PipeTransform } from '@angular/core';
import { MathTools } from '../../tools/math-tools';

@Pipe({
    name: 'floor',
    standalone: true
})
export class FloorPipe implements PipeTransform {

  transform(value: number, precision?: number): number {
    return MathTools.absoluteFloor(value, precision);
  }

}
