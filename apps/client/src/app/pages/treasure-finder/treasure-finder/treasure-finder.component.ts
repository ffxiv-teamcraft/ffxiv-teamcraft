import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LazyDataService } from '../../../core/data/lazy-data.service';
import { combineLatest, Observable, ReplaySubject } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { MapMarker } from '../../../modules/map/map-marker';
import { MapService } from '../../../modules/map/map.service';
import { uniq } from 'lodash';

@Component({
  selector: 'app-treasure-finder',
  templateUrl: './treasure-finder.component.html',
  styleUrls: ['./treasure-finder.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TreasureFinderComponent {

  map$: ReplaySubject<number> = new ReplaySubject<number>();

  treasureItemId$: ReplaySubject<number> = new ReplaySubject<number>();

  selectedTreasure$: ReplaySubject<any> = new ReplaySubject<any>();

  maps$ = this.lazyData.data$.pipe(
    map(data => {
      return Object.values<any>(data.maps).filter(row => {
        return data.treasures.some(t => t.map === row.id);
      });
    })
  );

  treasures$: Observable<any[]> = this.map$.pipe(
    map(mapId => {
      return this.lazyData.data.treasures
        .filter(t => t.map === mapId)
        .map(treasure => {
          const mapData = this.lazyData.data.maps[treasure.map];
          const coordsPercent = this.mapService.getPositionOnMap(mapData, treasure.coords);
          let offsetX = 94;
          let offsetY = 79.5;
          if ([12241, 12242, 12243].includes(treasure.item)) {
            offsetX = 47;
            offsetY = 30;
          }
          return {
            ...treasure,
            mapImage: mapData.image,
            coordsPercent,
            display: {
              x: coordsPercent.x * 2048 / 100 * (mapData.size_factor / 100) - offsetX,
              y: coordsPercent.y * 2048 / 100 * (mapData.size_factor / 100) - offsetY
            }
          };
        });
    })
  );

  treasureItemIds$ = this.treasures$.pipe(
    map(treasures => {
      return uniq(treasures.map(t => t.item));
    })
  );

  possibleTreasureMaps$ = combineLatest([this.treasures$, this.treasureItemId$]).pipe(
    map(([treasures, itemId]) => {
      return itemId === -1 ? treasures : treasures.filter(t => t.item === itemId);
    })
  );


  markers$: Observable<MapMarker[]> = this.selectedTreasure$.pipe(
    filter(t => t !== null),
    map(treasure => {
      return [{
        ...treasure.coords,
        iconType: 'img',
        iconImg: './assets/icons/treasure_marker.png',
        tooltip: `X: ${treasure.coords.x}, Y: ${treasure.coords.y}`
      }];
    })
  );

  constructor(private lazyData: LazyDataService, private mapService: MapService) {
  }

}
