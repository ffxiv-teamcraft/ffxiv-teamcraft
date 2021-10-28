import { Pipe, PipeTransform } from '@angular/core';
import { Observable } from 'rxjs';
import { I18nName } from '../../model/common/i18n-name';
import { LazyDataFacade } from '../../lazy-data/+state/lazy-data.facade';
import { mapIds } from '../../core/data/sources/map-ids';

@Pipe({
  name: 'mapName'
})
export class MapNamePipe implements PipeTransform {
  constructor(private lazyData: LazyDataFacade) {
  }

  transform(id: number): Observable<I18nName> {
    const placeId = mapIds.find((m) => m.id === id).zone ?? 1;
    return this.lazyData.getRow('places', placeId);
  }
}
