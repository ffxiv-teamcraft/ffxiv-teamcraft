import { Component } from '@angular/core';
import { IpcService } from '../../../core/electron/ipc.service';
import { ReplaySubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { LazyDataService } from '../../../core/data/lazy-data.service';
import { MapService } from '../../../modules/map/map.service';
import { Vector2 } from '../../../core/tools/vector2';
import { MapData } from '../../../modules/map/map-data';

@Component({
  selector: 'app-mappy-overlay',
  templateUrl: './mappy-overlay.component.html',
  styleUrls: ['./mappy-overlay.component.less']
})
export class MappyOverlayComponent {

  public state$: ReplaySubject<any> = new ReplaySubject<any>();

  public display$ = this.state$.pipe(
    map(state => {
      const mapData = this.lazyData.data.maps[state.mapId];
      return {
        ...state,
        map: mapData,
        mapStyle: mapData ? this.getMapStyle(mapData, state.playerCoords) : {}
      };
    })
  );

  constructor(private ipc: IpcService, private lazyData: LazyDataService, private mapService: MapService) {
    this.ipc.on('mappy-state', (event, data) => {
      this.state$.next(data);
    });
    this.ipc.send('mappy-state:get');
  }

  public getMapStyle(mapData: MapData, coords: Vector2): any {
    const c = mapData.size_factor / 100;
    const raw = {
      x: (41 / c) * (coords.x / 2048) + 1,
      y: (41 / c) * (coords.y / 2048) + 1
    };
    const position = this.mapService.getPositionOnMap(mapData, raw);
    return {
      transform: `translate(${50 - position.x}%, ${50 - position.y}%)`,
      position: position,
      raw: raw
    };
  }

}
