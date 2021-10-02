import { Pipe, PipeTransform } from '@angular/core';
import { Hookset } from '../../core/data/model/hookset';

@Pipe({
  name: 'hooksetActionId'
})
export class HooksetActionIdPipe implements PipeTransform {

  transform(hookset: Hookset): number {
    return [0, 4103, 4179][hookset];
  }

}
