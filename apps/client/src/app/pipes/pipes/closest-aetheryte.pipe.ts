import { Pipe, PipeTransform } from '@angular/core';
import { MapService } from '../../modules/map/map.service';
import { Aetheryte } from '../../core/data/aetheryte';
import { Observable } from 'rxjs';
import { Vector2 } from '../../core/tools/vector2';
import { filter, switchMap } from 'rxjs/operators';

@Pipe({
  name: 'closestAetheryte'
})
export class ClosestAetherytePipe implements PipeTransform {
  constructor(private mapService: MapService) {
  }

  transform(mapId: number, position: Vector2): Observable<Aetheryte | never> {
    return this.mapService.getMapById(mapId).pipe(
      filter((mapData) => mapData !== undefined && !!position),
      switchMap((mapData) => {
        return this.mapService.getNearestAetheryte(mapData, position);
      }),
      filter((res) => res && res.nameid !== undefined)
    );
  }
}
