import { ChangeDetectorRef, Component } from '@angular/core';
import { IpcService } from '../../../core/electron/ipc.service';
import { ReplaySubject } from 'rxjs';
import { map, tap, auditTime } from 'rxjs/operators';
import { LazyDataService } from '../../../core/data/lazy-data.service';
import { MapService } from '../../../modules/map/map.service';
import { Vector2 } from '../../../core/tools/vector2';
import { MapData } from '../../../modules/map/map-data';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { MappyReporterState, NpcEntry, ObjEntry } from '../../../core/electron/mappy-reporter';
import { uniqBy } from 'lodash';

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

  bnpcMarkerSize: Vector2 = {
    x: 32,
    y: 32
  };

  objMarkerSize: Vector2 = {
    x: 32,
    y: 32
  };

  trackPlayer = false;

  public state$: ReplaySubject<MappyReporterState> = new ReplaySubject<MappyReporterState>();

  public display$ = this.state$.pipe(
    auditTime(100),
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

  trackByNpc(index:number, entry: NpcEntry): string {
    return `${entry.nameId} ${entry.baseId}`;
  }

  trackByObj(index:number, entry: ObjEntry): string {
    return `${entry.id} ${entry.kind}`;
  }

}
