import { Pipe, PipeTransform, inject } from '@angular/core';
import { LazyDataFacade } from '../../lazy-data/+state/lazy-data.facade';
import { I18nName } from '@ffxiv-teamcraft/types';

@Pipe({
    name: 'worldName',
    standalone: true
})
export class WorldNamePipe implements PipeTransform {
  private readonly lazyData = inject(LazyDataFacade);


  transform(world: string): I18nName {
    return this.lazyData.getWorldName(world);
  }
}
