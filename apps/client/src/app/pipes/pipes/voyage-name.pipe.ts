import { Pipe, PipeTransform } from '@angular/core';
import { Observable } from 'rxjs';
import { LazyDataFacade } from '../../lazy-data/+state/lazy-data.facade';
import { I18nName } from '@ffxiv-teamcraft/types';

@Pipe({
  name: 'voyageName'
})
export class VoyageNamePipe implements PipeTransform {
  constructor(private lazyData: LazyDataFacade) {
  }

  transform(id: number, type: number): Observable<I18nName> {
    if (type === 0) {
      return this.lazyData.getI18nName('airshipVoyages', id);
    } else if (type === 1) {
      return this.lazyData.getI18nName('submarineVoyages', id);
    }
  }
}
