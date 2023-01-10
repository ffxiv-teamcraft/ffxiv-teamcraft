import { TeamcraftComponent } from '../../../core/component/teamcraft-component';
import { BehaviorSubject, combineLatest, map, Observable } from 'rxjs';
import { StepByStepDisplayData } from './step-by-step-display-data';
import { filter, startWith, switchMap, tap } from 'rxjs/operators';
import { getItemSource } from '../model/list-row';
import { NodeTypeIconPipe } from '../../../pipes/pipes/node-type-icon.pipe';
import { MapMarker } from '../../map/map-marker';
import { NavigationObjective } from '../../map/navigation-objective';
import { EorzeaFacade } from '../../eorzea/+state/eorzea.facade';
import { IpcService } from '../../../core/electron/ipc.service';
import { ListsFacade } from '../+state/lists.facade';
import { LayoutsFacade } from '../../../core/layout/+state/layouts.facade';
import { SettingsService } from '../../settings/settings.service';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { MapService } from '../../map/map.service';
import { EorzeanTimeService } from '../../../core/eorzea/eorzean-time.service';
import { AlarmsFacade } from '../../../core/alarms/+state/alarms.facade';
import { MapData } from '../../map/map-data';
import { Vector2 } from '../../../core/tools/vector2';
import { ElementRef, ViewChild } from '@angular/core';
import { StepByStepList } from './model/step-by-step-list';
import { ListDisplay } from '../../../core/layout/list-display';
import { DataType } from '../data/data-type';

export abstract class StepByStepComponent extends TeamcraftComponent {

  selectedMap$ = new BehaviorSubject(0);

  DataType = DataType;

  public containerRef: ElementRef;

  @ViewChild('container', { static: false })
  public set _containerRef(ref: ElementRef) {
    setTimeout(() => {
      this.containerRef = ref;
    }, 500);
  }

  public loading = true;

  public stepByStep$ = combineLatest([
    this.getDisplay(),
    this.settings.watchSetting('housingMap', this.settings.housingMap),
    this.lazyData.getEntry('maps')
  ]).pipe(
    map(([display, housingMap, maps]) => {
      return new StepByStepList(display, housingMap, maps);
    }),
    tap((list) => this.onNewStepByStep(list))
  );

  public currentMapDisplay$ = combineLatest([this.stepByStep$, this.getMapId()]).pipe(
    map(([stepByStep, mapId]) => {
      this.loading = false;
      return stepByStep.steps[mapId];
    })
  );

  public currentPath$: Observable<StepByStepDisplayData> = combineLatest([
    this.currentMapDisplay$,
    this.ipc.updatePositionHandlerPackets$.pipe(startWith(null)),
    this.stepByStep$,
    this.etime.getEorzeanTime()
  ]).pipe(
    filter(([display]) => Boolean(display)),
    switchMap(([display, position, stepByStep, etime]) => {
      const alarmMarkers = stepByStep.alarms.filter(row => {
        const alarms = getItemSource(row, DataType.ALARMS);
        return alarms.some(a => a.mapId === display.mapId);
      }).map(row => {
        return getItemSource(row, DataType.ALARMS).filter(a => a.mapId === display.mapId)
          .map(alarm => {
            const display = this.alarmsFacade.createDisplay(alarm, etime);
            return {
              row: row,
              marker: {
                x: alarm.coords.x,
                y: alarm.coords.y,
                iconType: 'img',
                zIndex: 999,
                iconImg: NodeTypeIconPipe.timed_icons[alarm.type],
                subtitle: this.etime.toStringTimer(display.remainingTime),
                subtitleStyle: display.spawned ? {
                  'text-shadow': `2px 0 0 #4880b1, -2px 0 0 #4880b1, 0 2px 0 #4880b1, 0 -2px 0 #4880b1, 1px 1px #4880b1, -1px -1px 0 #4880b1, 1px -1px 0 #4880b1, -1px 1px 0 #4880b1;`
                } : {}
              } as MapMarker
            };
          });
      }).flat();
      const markers: NavigationObjective[] = display.sources.map(source => {
        return display[source]
          .filter(row => row.row.amount > row.row.done)
          .map(row => {
            return {
              ...row.coords,
              itemId: row.row.id,
              type: row.type,
              listRow: row.row,
              icon: row.icon
            };
          });
      }).flat().filter(Boolean);
      return this.mapService.getMapById(display.mapId).pipe(
        switchMap(mapData => {
          const startingPoint = position ? this.mapService.getCoordsOnMap(mapData, {
            x: position.pos.x,
            y: position.pos.z
          }) : null;
          return this.mapService.getOptimizedPathOnMap(display.mapId, markers, startingPoint).pipe(
            map(steps => {
              return {
                path: {
                  map: mapData,
                  // Removing first step as it's the starting point.
                  steps: steps || [],
                  alarms: alarmMarkers
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
                  ...alarmMarkers.map(m => m.marker),
                  ...display.sources
                    .filter(s => s !== DataType.ALARMS)
                    .map(source => {
                      return display[source]
                        .filter(row => row.row.done < row.row.amount)
                        .map(row => {
                          return {
                            ...row.coords,
                            zIndex: 999,
                            iconType: 'img',
                            iconImg: row.icon,
                            additionalStyle: {
                              width: '32px',
                              height: '32px'
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

  protected constructor(protected eorzeaFacade: EorzeaFacade, protected ipc: IpcService,
                        protected listsFacade: ListsFacade, protected layoutsFacade: LayoutsFacade,
                        protected settings: SettingsService, protected lazyData: LazyDataFacade,
                        protected mapService: MapService, protected etime: EorzeanTimeService, protected alarmsFacade: AlarmsFacade) {
    super();
  }

  protected abstract getDisplay(): Observable<ListDisplay>;

  protected abstract getMapId(): Observable<number>;

  protected onNewStepByStep(list: StepByStepList): void {
    return;
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
}
