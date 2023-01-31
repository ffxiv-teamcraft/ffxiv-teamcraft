import { Pipe, PipeTransform } from '@angular/core';
import { I18nName } from '@ffxiv-teamcraft/types';
import { aetheryteNames } from '../../core/data/sources/aetheryte-names';

@Pipe({
  name: 'aetheryteName'
})
export class AetheryteNamePipe implements PipeTransform {
  transform(id: number): I18nName {
    return aetheryteNames[id];
  }
}
