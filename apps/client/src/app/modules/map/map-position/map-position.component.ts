import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Vector2 } from '@ffxiv-teamcraft/types';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { MapComponent } from '../map/map.component';
import { NzModalService } from 'ng-zorro-antd/modal';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { distinctUntilChanged, filter, first, switchMap } from 'rxjs/operators';
import { I18nRowPipe } from '../../../core/i18n/i18n-row.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { I18nPipe } from '../../../core/i18n.pipe';
import { MapNamePipe } from '../../../pipes/pipes/map-name.pipe';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzWaveModule } from 'ng-zorro-antd/core/wave';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NgIf } from '@angular/common';
import { FlexModule } from '@angular/flex-layout/flex';

@Component({
    selector: 'app-map-position',
    templateUrl: './map-position.component.html',
    styleUrls: ['./map-position.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [FlexModule, NgIf, NzButtonModule, NzWaveModule, NzToolTipModule, NzIconModule, MapNamePipe, I18nPipe, TranslateModule, I18nRowPipe]
})
export class MapPositionComponent {
  @Input()
  marker: Vector2;

  @Input()
  additionalMarkers: Vector2[] = [];

  @Input()
  showZoneName = false;

  @Input()
  showMapName = false;

  @Input()
  hideCoords = false;

  @Input()
  flex = 'column';

  @Input()
  flexLayoutAlign = 'flex-start center';

  private readonly zoneId$ = new BehaviorSubject<number | undefined>(undefined);

  private readonly mapId$ = new BehaviorSubject<number | undefined>(undefined);

  private readonly title$ = combineLatest([this.zoneId$, this.mapId$]).pipe(
    filter(([zoneId, mapId]) => zoneId >= 0 || mapId >= 0),
    distinctUntilChanged(([zoneA, mapA], [zoneB, mapB]) => zoneA === zoneB && mapA === mapB),
    switchMap(([zoneId, mapId]) => this.i18n.getNameObservable('places', zoneId >= 0 ? zoneId : mapId))
  );

  constructor(private dialog: NzModalService, private i18n: I18nToolsService) {
  }

  get zoneId(): number | undefined {
    return this.zoneId$.getValue();
  }

  @Input()
  set zoneId(val: number | undefined) {
    this.zoneId$.next(val);
  }

  get mapId(): number | undefined {
    return this.mapId$.getValue();
  }

  @Input()
  set mapId(val: number | undefined) {
    this.mapId$.next(val);
  }

  getMarker(): Vector2 {
    if (!this.marker) {
      return {
        x: 0,
        y: 0
      };
    }
    return {
      x: Math.floor(this.marker.x * 100) / 100,
      y: Math.floor(this.marker.y * 100) / 100
    };
  }

  openMap(): void {
    this.title$.pipe(first()).subscribe((title) => {
      this.dialog.create({
        nzTitle: title,
        nzContent: MapComponent,
        nzData: {
          mapId: this.mapId,
          markers: [this.marker, ...(this.additionalMarkers || [])]
        },
        nzFooter: null
      });
    });
  }
}
