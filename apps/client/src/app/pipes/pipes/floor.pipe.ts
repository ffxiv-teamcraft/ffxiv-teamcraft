import { Pipe, PipeTransform } from '@angular/core';
import { MathTools } from '../../tools/math-tools';

@Pipe({
  name: 'floor'
})
export class FloorPipe implements PipeTransform {

  transform(value: number, args?: any): number {
    return MathTools.absoluteFloor(value);
  }

}
