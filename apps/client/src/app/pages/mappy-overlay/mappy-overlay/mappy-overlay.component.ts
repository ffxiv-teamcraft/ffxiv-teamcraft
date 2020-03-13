import { Component } from '@angular/core';
import { IpcService } from '../../../core/electron/ipc.service';
import { ReplaySubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { LazyDataService } from '../../../core/data/lazy-data.service';
import { MapService } from '../../../modules/map/map.service';
import { Vector2 } from '../../../core/tools/vector2';
import { MapData } from '../../../modules/map/map-data';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { MappyReporterState } from '../../../core/electron/mappy-reporter';

@Component({
  selector: 'app-mappy-overlay',
  templateUrl: './mappy-overlay.component.html',
  styleUrls: ['./mappy-overlay.component.less']
})
export class MappyOverlayComponent {

  scale = 1;
  pan: Vector2 = { x: -1024, y: -1024 };
  editedPan = { x: 0, y: 0 };

  playerMarkerSize: Vector2 = {
    x: 300,
    y: 300
  };

  trackPlayer = false;

  public state$: ReplaySubject<MappyReporterState> = new ReplaySubject<MappyReporterState>();

  public display$ = this.state$.pipe(
    map(state => {
      const mapData = this.lazyData.data.maps[state.mapId];
      return <any>{
        ...state,
        map: mapData,
        player: mapData ? this.getPosition(mapData, state.playerCoords) : {},
        playerRotationTransform: `rotate(${(state.playerRotation - Math.PI) * -1}rad)`,
        absolutePlayer: mapData ? this.getPosition(mapData, state.playerCoords, false) : {},
        debug: {
          player: mapData ? this.getCoords(mapData, state.playerCoords, true) : {}
        }
      };
    }),
    tap(state => {
      if (this.trackPlayer) {
        // TODO proper player tracking by adding current window size offset
        this.editedPan = { x: 0, y: 0 };
        this.pan = {
          x: -1 * state.absolutePlayer.x * 2048 / 100,
          y: -1 * state.absolutePlayer.y * 2048 / 100
        };
      }
    })
  );

  constructor(private ipc: IpcService, private lazyData: LazyDataService, private mapService: MapService,
              private sanitizer: DomSanitizer) {
    this.ipc.on('mappy-state', (event, data) => {
      this.state$.next(data);
    });
    this.ipc.send('mappy-state:get');
  }

  public getCoords(mapData: MapData, coords: Vector2, centered: boolean): Vector2 {
    const c = mapData.size_factor / 100;
    const x = (coords.x + mapData.offset_x) * c;
    const y = (coords.y + mapData.offset_y) * c;
    return {
      x: (41 / c) * ((x + (centered ? 1024 : 0)) / 2048) + 1,
      y: (41 / c) * ((y + (centered ? 1024 : 0)) / 2048) + 1
    };
  }

  public getPosition(mapData: MapData, coords: Vector2, centered = true): Vector2 {
    const raw = this.getCoords(mapData, coords, centered);
    return this.mapService.getPositionOnMap(mapData, raw);
  }

  /* Method which adds style to the image */
  imageTransform(): SafeStyle {
    return this.sanitizer.bypassSecurityTrustStyle(`translate(${this.pan['x'] + this.editedPan['x']}px,${
      this.pan['y'] + this.editedPan['y']
    }px) rotate(0deg) scale(${this.scale})`);
  }

  /* Method will be called on pan image */
  onPan(e: any): void {
    this.editedPan = { x: e['deltaX'], y: e['deltaY'] };
    if (e.isFinal) {
      this.pan = {
        x: this.pan.x + this.editedPan.x,
        y: this.pan.y + this.editedPan.y
      };
      this.editedPan = { x: 0, y: 0 };
    }
  }

  /* Method will be called when user zooms image */
  onZoomP(): void {
    this.scale = this.scale + 0.1;
  }

  /* Method will be called when user zooms out image */
  onZoomM(): void {
    if (this.scale <= 0.5) {
      return;
    } else {
      this.scale = this.scale - 0.1;
    }
  }

  /* Method will be called on mouse wheel scroll */
  onScroll(e: any): void {
    if (e['deltaY'] < 0) {
      this.onZoomP();
    }
    if (e['deltaY'] > 0) {
      this.onZoomM();
    }
  }

}
