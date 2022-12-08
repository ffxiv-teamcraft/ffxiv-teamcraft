import { ChangeDetectionStrategy, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { observeInput } from '../../../core/rxjs/observe-input';
import { BehaviorSubject, combineLatest, map, Observable, tap } from 'rxjs';
import { StepByStepList } from './model/step-by-step-list';
import { ListDisplay } from '../../../core/layout/list-display';
import { MapListStep } from './model/map-list-step';
import { DataType } from '../data/data-type';
import { PermissionLevel } from '../../../core/database/permissions/permission-level.enum';
import { filter, shareReplay, switchMap } from 'rxjs/operators';
import { SettingsService } from '../../settings/settings.service';
import { debounceTimeAfter } from '../../../core/rxjs/debounce-time-after';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { LayoutOrderService } from '../../../core/layout/layout-order.service';
import { LayoutRowOrder } from '../../../core/layout/layout-row-order.enum';
import { MapData } from '../../map/map-data';
import { Vector2 } from '../../../core/tools/vector2';
import { MapService } from '../../map/map.service';
import { MapMarker } from '../../map/map-marker';

@Component({
  selector: 'app-step-by-step-details',
  templateUrl: './step-by-step-details.component.html',
  styleUrls: ['./step-by-step-details.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StepByStepDetailsComponent {
  DataType = DataType;

  @Input()
  display: ListDisplay;

  @Input()
  permissionLevel: PermissionLevel;

  display$: Observable<ListDisplay> = observeInput(this, 'display');

  selectedMap$ = new BehaviorSubject(0);

  stepByStepList$: Observable<StepByStepList> = combineLatest([this.display$, this.settings.watchSetting('housingMap', 72), this.lazyData.getEntry('maps')]).pipe(
    map(([display, housingMap, maps]) => {
      return new StepByStepList(display, housingMap, maps);
    }),
    tap(list => {
      if (!list.steps[this.selectedMap$.value] && list.maps.length > 0) {
        const nextIncompleteMap = list.maps.find(mapId => !list.steps[mapId].complete);
        this.selectedMap$.next(nextIncompleteMap || 0);
      }
    })
  );

  currentMapDisplay$: Observable<MapListStep> = combineLatest([
    this.stepByStepList$,
    this.selectedMap$
  ]).pipe(
    map(([list, mapId]) => {
      return list.steps[mapId];
    }),
    shareReplay(1)
  );

  navigationStatus$ = combineLatest([this.stepByStepList$, this.selectedMap$]).pipe(
    map(([list, mapId]) => {
      const mapIndex = list.maps.indexOf(mapId);
      const next = list.maps[mapIndex + 1] || null;
      const previous = mapIndex <= 0 ? null : list.maps[mapIndex - 1];
      const nextIncomplete = list.maps.slice(mapIndex + 1).find(id => !list.steps[id].complete);
      const previousIncomplete = mapIndex <= 0 ? null : list.maps.slice(0, mapIndex - 1).find(id => !list.steps[id].complete);
      return {
        next,
        previous,
        nextIncomplete,
        previousIncomplete
      };
    })
  );

  sortedAlarms$ = this.stepByStepList$.pipe(
    map(list => list.alarms),
    filter(alarms => alarms.length > 0),
    switchMap(alarms => {
      return this.layoutOrderService.order(alarms, 'TIMER', LayoutRowOrder.ASC);
    })
  );

  public containerRef: ElementRef;

  @ViewChild('container', { static: false })
  public set _containerRef(ref: ElementRef) {
    setTimeout(() => {
      this.containerRef = ref;
    }, 500);
  }

  public currentPath$ = this.currentMapDisplay$.pipe(
    switchMap(display => {
      const markers = display.sources.map(source => {
        return display[source].map(row => {
          return {
            ...row.coords,
            name: ''
          };
        });
      }).flat().filter(Boolean);
      return combineLatest([
        this.mapService.getMapById(display.mapId),
        this.mapService.getOptimizedPathOnMap(display.mapId, markers)
      ]).pipe(
        map(([mapData, steps]) => ({ map: mapData, steps }))
      );
    })
  );

  additionalMarkers$ = this.currentMapDisplay$.pipe(
    map(display => {
      return display.sources.map(source => {
        return display[source].map(row => {
          return {
            ...row.coords,
            zIndex: 999,
            iconType: 'img',
            iconImg: row.icon,
            additionalStyle: {
              width: '24px',
              height: '24px'
            }
          } as MapMarker;
        });
      }).flat().filter(Boolean);
    })
  );

  constructor(public settings: SettingsService, private lazyData: LazyDataFacade,
              private layoutOrderService: LayoutOrderService, private mapService: MapService) {
  }

  getPositionPercent(mapData: MapData, coords: Vector2): Vector2 {
    const positionPercents = this.mapService.getPositionOnMap(mapData, coords);
    return {
      x: positionPercents.x * this.containerRef.nativeElement.offsetWidth / 100,
      y: positionPercents.y * this.containerRef.nativeElement.offsetHeight / 100
    };
  }

  trackById(index: number, item: { id: number }): number {
    return item.id;
  }

  trackByMapId(index: number, mapId: number): number {
    return mapId;
  }
}
