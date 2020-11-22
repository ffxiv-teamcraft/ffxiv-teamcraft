import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Vector2 } from '../../../core/tools/vector2';
import { LocalizedDataService } from '../../../core/data/localized-data.service';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { MapComponent } from '../map/map.component';
import { NzModalService } from 'ng-zorro-antd/modal';
import { LazyDataService } from '../../../core/data/lazy-data.service';
import { I18nName } from '../../../model/common/i18n-name';
import { LocalizedLazyDataService } from '../../../core/data/localized-lazy-data.service';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { distinctUntilChanged, switchMap, shareReplay, filter, first } from 'rxjs/operators';

@Component({
  selector: 'app-map-position',
  templateUrl: './map-position.component.html',
  styleUrls: ['./map-position.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapPositionComponent {
  @Input()
  marker: Vector2;

  private readonly zoneId$ = new BehaviorSubject<number | undefined>(undefined);
  get zoneId(): number | undefined {
    return this.zoneId$.getValue();
  }
  @Input()
  set zoneId(val: number | undefined) {
    this.zoneId$.next(val);
  }

  private readonly mapId$ = new BehaviorSubject<number | undefined>(undefined);
  get mapId(): number | undefined {
    return this.mapId$.getValue();
  }
  @Input()
  set mapId(val: number | undefined) {
    this.mapId$.next(val);
  }

  private readonly title$ = combineLatest([this.zoneId$, this.mapId$]).pipe(
    filter(([zoneId, mapId]) => zoneId >= 0 || mapId >= 0),
    distinctUntilChanged(([zoneA, mapA], [zoneB, mapB]) => zoneA === zoneB && mapA === mapB),
    switchMap(([zoneId, mapId]) => this.i18n.resolveName(this.l12n.getPlace(zoneId >= 0 ? zoneId : mapId)))
  );

  @Input()
  showZoneName = false;

  @Input()
  showMapName = false;

  @Input()
  flex = 'column';

  @Input()
  flexLayoutAlign = 'flex-start center';

  constructor(private dialog: NzModalService, private l12n: LocalizedLazyDataService, private i18n: I18nToolsService) {}

  getMarker(): Vector2 {
    if (!this.marker) {
      return {
        x: 0,
        y: 0,
      };
    }
    return {
      x: Math.round(this.marker.x),
      y: Math.round(this.marker.y),
    };
  }

  openMap(): void {
    this.title$.pipe(first()).subscribe((title) => {
      this.dialog.create({
        nzTitle: title,
        nzContent: MapComponent,
        nzComponentParams: {
          mapId: this.mapId,
          markers: [this.marker],
        },
        nzFooter: null,
      });
    });
  }
}
