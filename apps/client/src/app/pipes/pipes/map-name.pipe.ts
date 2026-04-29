import { Pipe, PipeTransform, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { I18nName } from '@ffxiv-teamcraft/types';
import { LazyDataFacade } from '../../lazy-data/+state/lazy-data.facade';
import { mapIds } from '../../core/data/sources/map-ids';

@Pipe({
    name: 'mapName',
    standalone: true
})
export class MapNamePipe implements PipeTransform {
  private lazyData = inject(LazyDataFacade);


  transform(id: number): Observable<I18nName> {
    const placeId = mapIds.find((m) => m.id === id)?.zone ?? 1;
    return this.lazyData.getRow('places', placeId);
  }
}
