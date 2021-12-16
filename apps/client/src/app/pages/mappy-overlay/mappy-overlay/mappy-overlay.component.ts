import { ChangeDetectionStrategy, Component, HostListener, OnInit } from '@angular/core';
import { IpcService } from '../../../core/electron/ipc.service';
import { ReplaySubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MapService } from '../../../modules/map/map.service';
import { Vector2 } from '../../../core/tools/vector2';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { MappyMarker, MappyReporterState } from '../../../core/electron/mappy/mappy-reporter';

@Component({
  selector: 'app-mappy-overlay',
  templateUrl: './mappy-overlay.component.html',
  styleUrls: ['./mappy-overlay.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MappyOverlayComponent implements OnInit {

  scale = 1;

  pan: Vector2 = { x: -1024, y: -1024 };

  editedPan = { x: 0, y: 0 };

  showDebugBox = true;

  markerSizes = {
    player: {
      x: 300,
      y: 300
    },
    bnpc: {
      x: 32,
      y: 32
    },
    aetheryte: {
      x: 32,
      y: 32
    },
    enpc: {
      x: 32,
      y: 32
    },
    obj: {
      x: 32,
      y: 32
    }
  };

  windowSize: Vector2;

  trackPlayer = true;

  showMappyLayers = true;

  watchMappy = true;

  showLocalLayers = false;

  showLGBLayers = false;

  public state$: ReplaySubject<MappyReporterState> = new ReplaySubject<MappyReporterState>();

  public display$ = this.state$.pipe(
    tap(state => {
      if (this.trackPlayer && state.player) {
        this.editedPan = { x: 0, y: 0 };
        this.scale = 1;
        this.pan = {
          x: (-1 * state.player.x * 2048 / 100) + this.windowSize.x / 2,
          y: (-1 * state.player.y * 2048 / 100) + this.windowSize.y / 2
        };
        this.updateImageTransform();
      }
    })
  );

  public imageTransform: SafeStyle;

  constructor(private ipc: IpcService, private mapService: MapService,
              private sanitizer: DomSanitizer) {
    this.ipc.on('mappy-state', (event, data) => {
      this.state$.next(data);
    });
    this.ipc.send('mappy-state:get');
    setInterval(() => {
      if (this.watchMappy) {
        this.reloadMappyData();
      }
    }, 2000);
  }

  reloadMappyData(): void {
    this.ipc.send('mappy:reload');
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
      this.updateImageTransform();
    }
  }

  /* Method will be called when user zooms image */
  onZoomP(): void {
    this.scale = Math.floor(10 * (this.scale + 0.1)) / 10;
    this.updateImageTransform();
  }

  /* Method will be called when user zooms out image */
  onZoomM(): void {
    if (this.scale <= 0.5) {
      return;
    } else {
      this.scale = Math.floor(10 * (this.scale - 0.1)) / 10;
      this.updateImageTransform();
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

  trackByUid(index: number, entry: MappyMarker): string {
    return entry.uniqId;
  }

  trackBySnap(index: number): number {
    return index;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.windowSize = {
      x: event.target.innerWidth,
      y: event.target.innerHeight - 44
    };
  }

  ngOnInit(): void {
    this.windowSize = {
      x: window.innerWidth,
      y: window.innerHeight - 44
    };
    const mock = { x: 63, y: 40 };
    this.pan = {
      x: -1 * (mock.x * 2048 / 100),
      y: -1 * (mock.y * 2048 / 100)
    };
    this.updateImageTransform();
  }

  private updateImageTransform(): void {
    this.imageTransform = this.sanitizer.bypassSecurityTrustStyle(`translate(${this.pan['x'] + this.editedPan['x']}px,${
      this.pan['y'] + this.editedPan['y']
    }px) scale(${this.scale}) rotate(0deg)`);
  }

}
