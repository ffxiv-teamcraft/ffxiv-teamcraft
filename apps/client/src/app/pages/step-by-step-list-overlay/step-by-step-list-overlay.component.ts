import { ChangeDetectionStrategy, Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EorzeaFacade } from '../../modules/eorzea/+state/eorzea.facade';
import { IpcService } from '../../core/electron/ipc.service';
import { filter, shareReplay, startWith, switchMap, tap } from 'rxjs/operators';
import { List } from '../../modules/list/model/list';
import { ListsFacade } from '../../modules/list/+state/lists.facade';
import { LayoutsFacade } from '../../core/layout/+state/layouts.facade';
import { OverlayContainerModule } from '../../modules/overlay-container/overlay-container.module';
import { BehaviorSubject, combineLatest, map, Observable } from 'rxjs';
import { StepByStepList } from '../../modules/list/step-by-step-details/model/step-by-step-list';
import { SettingsService } from '../../modules/settings/settings.service';
import { LazyDataFacade } from '../../lazy-data/+state/lazy-data.facade';
import { MapMarker } from '../../modules/map/map-marker';
import { MapService } from '../../modules/map/map.service';
import { MapModule } from '../../modules/map/map.module';
import { MapData } from '../../modules/map/map-data';
import { Vector2 } from '../../core/tools/vector2';
import { PipesModule } from '../../pipes/pipes.module';
import { CoreModule } from '../../core/core.module';
import { StepByStepDisplayData } from '../../modules/list/step-by-step-details/step-by-step-display-data';
import { FullpageMessageModule } from '../../modules/fullpage-message/fullpage-message.module';
import { DataType } from '../../modules/list/data/data-type';
import { getItemSource } from '../../modules/list/model/list-row';
import { NodeTypeIconPipe } from '../../pipes/pipes/node-type-icon.pipe';
import { NzListModule } from 'ng-zorro-antd/list';
import { NavigationStep } from '../../modules/map/navigation-step';
import { NavigationObjective } from '../../modules/map/navigation-objective';
import { ItemIconModule } from '../../modules/item-icon/item-icon.module';
import { ListModule } from '../../modules/list/list.module';
import { PermissionLevel } from '../../core/database/permissions/permission-level.enum';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { PageLoaderModule } from '../../modules/page-loader/page-loader.module';
import { EorzeanTimeService } from '../../core/eorzea/eorzean-time.service';
import { AlarmsFacade } from '../../core/alarms/+state/alarms.facade';

@Component({
  selector: 'app-step-by-step-list-overlay',
  standalone: true,
  imports: [CommonModule, OverlayContainerModule, MapModule, PipesModule, CoreModule, FullpageMessageModule,
    NzListModule, ItemIconModule, ListModule,
    NzDividerModule, NzBreadCrumbModule, NzEmptyModule, PageLoaderModule],
  templateUrl: './step-by-step-list-overlay.component.html',
  styleUrls: ['./step-by-step-list-overlay.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StepByStepListOverlayComponent {
  DataType = DataType;

  public loading = true;

  public containerRef: ElementRef;

  @ViewChild('container', { static: false })
  public set _containerRef(ref: ElementRef) {
    setTimeout(() => {
      this.containerRef = ref;
    }, 500);
  }

  public zoneId$ = this.eorzeaFacade.zoneId$;

  public mapId$ = this.eorzeaFacade.mapId$.pipe(
    tap(() => this.loading = true)
  );

  public position$ = this.ipc.updatePositionHandlerPackets$;

  public list$ = this.listsFacade.selectedList$;

  private adaptativeFilter$ = new BehaviorSubject<boolean>(localStorage.getItem('adaptative-filter') === 'true');

  public permissionLevel$: Observable<PermissionLevel> = this.listsFacade.selectedListPermissionLevel$;

  private display$ = combineLatest([this.list$, this.adaptativeFilter$]).pipe(
    switchMap(([list, adaptativeFilter]) => this.layoutsFacade.getDisplay(list, adaptativeFilter, false)),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  public stepByStep$ = combineLatest([
    this.display$,
    this.settings.watchSetting('housingMap', this.settings.housingMap),
    this.lazyData.getEntry('maps')
  ]).pipe(
    map(([display, housingMap, maps]) => {
      return new StepByStepList(display, housingMap, maps);
    })
  );

  public closestMap$ = combineLatest([
    this.mapId$,
    this.stepByStep$
  ]).pipe(
    switchMap(([mapId, stepByStep]) => {
      return combineLatest([this.mapService.getMapById(mapId), ...stepByStep.maps.filter(id => id !== mapId && !stepByStep.steps[id].complete).map(id => this.mapService.getMapById(id))]).pipe(
        map(([currentMap, ...maps]: MapData[]) => {
          return maps.sort((a, b) => {
            return this.mapService.getTpCost(currentMap.aetherytes[0], a.aetherytes[0]) -
              this.mapService.getTpCost(currentMap.aetherytes[0], b.aetherytes[0]);
          })[0]?.id;
        })
      );
    })
  );

  public currentMapDisplay$ = combineLatest([this.stepByStep$, this.mapId$]).pipe(
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
                  ...display.sources.map(source => {
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

  public stepsList$ = this.currentPath$.pipe(
    map(path => path.path.steps.slice(1))
  );

  markedAsDone = [];

  constructor(private eorzeaFacade: EorzeaFacade, private ipc: IpcService,
              private listsFacade: ListsFacade, private layoutsFacade: LayoutsFacade,
              private settings: SettingsService, private lazyData: LazyDataFacade,
              private mapService: MapService, private etime: EorzeanTimeService, private alarmsFacade: AlarmsFacade) {
    this.layoutsFacade.loadAll();
    this.ipc.send('overlay:pcap', { enabled: true, url: '/step-by-step-list-overlay' });
    this.ipc.mainWindowState$.pipe(
      filter(state => {
        return state.lists && state.lists.selectedId && state.layouts;
      })
    ).subscribe((state) => {
      this.listsFacade.overlayListsLoaded(Object.values<List>(state.lists.listDetails.entities).filter(list => list.$key === state.lists.selectedId));
      this.listsFacade.select(state.lists.selectedId);
      this.layoutsFacade.selectFromOverlay(state.layouts.selectedKey);
    });
  }

  getPositionPercent(mapData: MapData, coords: Vector2): Vector2 {
    const positionPercents = this.mapService.getPositionPercentOnMap(mapData, coords);
    return {
      x: positionPercents.x * this.containerRef.nativeElement.offsetWidth / 100,
      y: positionPercents.y * this.containerRef.nativeElement.offsetHeight / 100
    };
  }

  markStepAsDone(step: NavigationStep): void {
    this.markedAsDone.push(step.itemId);
    this.listsFacade.setItemDone(step.itemId, step.iconid, step.finalItem, step.item_amount, null, step.total_item_amount);
  }

  trackById(index: number, item: { id: number }): number {
    return item.id;
  }
}
