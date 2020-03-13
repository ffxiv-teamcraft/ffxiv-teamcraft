import { Component, TemplateRef, ViewChild } from '@angular/core';
import { IpcService } from '../../../core/electron/ipc.service';
import { ReplaySubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { LazyDataService } from '../../../core/data/lazy-data.service';
import { MapService } from '../../../modules/map/map.service';
import { Vector2 } from '../../../core/tools/vector2';
import { MapData } from '../../../modules/map/map-data';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';

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
    x: 48,
    y: 48
  };

  public state$: ReplaySubject<any> = new ReplaySubject<any>();

  public display$ = this.state$.pipe(
    map(state => {
      const mapData = this.lazyData.data.maps[state.mapId];
      return {
        ...state,
        map: mapData,
        player: this.getPosition(mapData, state.playerCoords)
      };
    })
  );

  @ViewChild('canvasElement', { static: false })
  public canvasElement: TemplateRef<HTMLCanvasElement>;

  constructor(private ipc: IpcService, private lazyData: LazyDataService, private mapService: MapService,
              private sanitizer: DomSanitizer) {
    this.ipc.on('mappy-state', (event, data) => {
      this.state$.next(data);
    });
    this.ipc.send('mappy-state:get');
  }

  public getPosition(mapData: MapData, coords: Vector2): any {
    const c = mapData.size_factor / 100;
    const raw = {
      x: (41 / c) * ((coords.x + 1024) / 2048) + 1,
      y: (41 / c) * ((coords.y + 1024) / 2048) + 1
    };
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
