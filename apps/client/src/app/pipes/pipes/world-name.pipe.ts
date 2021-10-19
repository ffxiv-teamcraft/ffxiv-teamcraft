import { Pipe, PipeTransform } from '@angular/core';
import { Observable } from 'rxjs';
import { LazyDataFacade } from '../../lazy-data/+state/lazy-data.facade';
import { I18nName } from '../../model/common/i18n-name';

@Pipe({
  name: 'worldName'
})
export class WorldNamePipe implements PipeTransform {
  constructor(private readonly lazyData: LazyDataFacade) {
  }

  transform(world: string): Observable<I18nName> {
    return this.lazyData.getWorldName(world);
  }
}
