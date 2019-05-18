import { Pipe, PipeTransform } from '@angular/core';
import { MathTools } from '../../tools/math-tools';

@Pipe({
  name: 'ceil'
})
export class CeilPipe implements PipeTransform {

  transform(value: number, args?: any): number {
    return MathTools.absoluteCeil(value);
  }

}
