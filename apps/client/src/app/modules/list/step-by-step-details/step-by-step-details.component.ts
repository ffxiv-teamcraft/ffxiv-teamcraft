import { ChangeDetectionStrategy, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { observeInput } from '../../../core/rxjs/observe-input';
import { BehaviorSubject, combineLatest, map, Observable, tap } from 'rxjs';
import { StepByStepList } from './model/step-by-step-list';
import { ListDisplay } from '../../../core/layout/list-display';
import { MapListStep } from './model/map-list-step';
import { DataType } from '../data/data-type';
import { PermissionLevel } from '../../../core/database/permissions/permission-level.enum';
import { distinctUntilChanged, filter, shareReplay, startWith, switchMap, takeUntil } from 'rxjs/operators';
import { SettingsService } from '../../settings/settings.service';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { LayoutOrderService } from '../../../core/layout/layout-order.service';
import { LayoutRowOrder } from '../../../core/layout/layout-row-order.enum';
import { MapData } from '../../map/map-data';
import { Vector2 } from '../../../core/tools/vector2';
import { MapService } from '../../map/map.service';
import { MapMarker } from '../../map/map-marker';
import { PlatformService } from '../../../core/tools/platform.service';
import { IpcService } from '../../../core/electron/ipc.service';
import { EorzeaFacade } from '../../eorzea/+state/eorzea.facade';
import { TeamcraftComponent } from '../../../core/component/teamcraft-component';
import { StepByStepDisplayData } from './step-by-step-display-data';

@Component({
  selector: 'app-step-by-step-details',
  templateUrl: './step-by-step-details.component.html',
  styleUrls: ['./step-by-step-details.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StepByStepDetailsComponent extends TeamcraftComponent {
  DataType = DataType;

  @Input()
  display: ListDisplay;

  @Input()
  permissionLevel: PermissionLevel;

  display$: Observable<ListDisplay> = observeInput(this, 'display');

  selectedMap$ = new BehaviorSubject(0);

  stepByStepList$: Observable<StepByStepList> = combineLatest([this.display$, this.settings.watchSetting('housingMap', this.settings.housingMap), this.lazyData.getEntry('maps')]).pipe(
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


  public currentPath$: Observable<StepByStepDisplayData> = combineLatest([
    this.currentMapDisplay$,
    this.ipc.updatePositionHandlerPackets$.pipe(startWith(null)),
    this.eorzeaFacade.mapId$
  ]).pipe(
    switchMap(([display, position, mapId]) => {
      const markers = display.sources.map(source => {
        return display[source]
          .filter(row => row.row.amount > row.row.done)
          .map(row => {
            return {
              ...row.coords
            };
          });
      }).flat().filter(Boolean);
      return this.mapService.getMapById(display.mapId).pipe(
        switchMap(mapData => {
          const startingPoint = position && mapId === display.mapId ? this.mapService.getCoordsOnMap(mapData, {
            x: position.pos.x,
            y: position.pos.z
          }) : null;
          return this.mapService.getOptimizedPathOnMap(display.mapId, markers, startingPoint).pipe(
            map(steps => {
              return {
                path: {
                  map: mapData,
                  steps
                },
                additionalMarkers: [
                  startingPoint ? {
                    ...startingPoint,
                    iconType: 'img',
                    zIndex: 999,
                    iconImg: './assets/icons/map/cursor.png',
                    additionalStyle: {
                      transform: `rotate(${(position.rotation - Math.PI) * -1}rad)`,
                      'margin-top': '-16px',
                      'margin-left': '-16px'
                    }
                  } as MapMarker : null,
                  ...display.sources.map(source => {
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
                  }).flat()
                ].filter(Boolean)
              };
            })
          );
        })
      );
    })
  );

  public isDesktop = this.platformService.isDesktop();

  constructor(public settings: SettingsService, private lazyData: LazyDataFacade,
              private layoutOrderService: LayoutOrderService, private mapService: MapService,
              private platformService: PlatformService, private ipc: IpcService,
              private eorzeaFacade: EorzeaFacade) {
    super();
    combineLatest([
      this.eorzeaFacade.mapId$.pipe(distinctUntilChanged()),
      this.stepByStepList$
    ]).pipe(
      takeUntil(this.onDestroy$)
    ).subscribe(([mapId, list]) => {
      if (list.maps.includes(mapId)) {
        this.selectedMap$.next(mapId);
      }
    });
  }

  toggleOverlay(): void {
    this.ipc.openOverlay('/step-by-step-list-overlay');
  }

  getPositionPercent(mapData: MapData, coords: Vector2): Vector2 {
    const positionPercents = this.mapService.getPositionPercentOnMap(mapData, coords);
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
