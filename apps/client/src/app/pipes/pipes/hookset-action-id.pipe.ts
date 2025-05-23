import { Pipe, PipeTransform } from '@angular/core';
import { Hookset } from '@ffxiv-teamcraft/types';

@Pipe({
    name: 'hooksetActionId',
    standalone: true
})
export class HooksetActionIdPipe implements PipeTransform {

  transform(hookset: Hookset): number {
    return [0, 4103, 4179][hookset];
  }

}
