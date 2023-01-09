import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EorzeaFacade } from '../../modules/eorzea/+state/eorzea.facade';
import { IpcService } from '../../core/electron/ipc.service';
import { filter, shareReplay, switchMap, tap } from 'rxjs/operators';
import { List } from '../../modules/list/model/list';
import { ListsFacade } from '../../modules/list/+state/lists.facade';
import { LayoutsFacade } from '../../core/layout/+state/layouts.facade';
import { OverlayContainerModule } from '../../modules/overlay-container/overlay-container.module';
import { BehaviorSubject, combineLatest, map, Observable } from 'rxjs';
import { SettingsService } from '../../modules/settings/settings.service';
import { LazyDataFacade } from '../../lazy-data/+state/lazy-data.facade';
import { MapService } from '../../modules/map/map.service';
import { MapModule } from '../../modules/map/map.module';
import { MapData } from '../../modules/map/map-data';
import { PipesModule } from '../../pipes/pipes.module';
import { CoreModule } from '../../core/core.module';
import { FullpageMessageModule } from '../../modules/fullpage-message/fullpage-message.module';
import { NzListModule } from 'ng-zorro-antd/list';
import { NavigationStep } from '../../modules/map/navigation-step';
import { ItemIconModule } from '../../modules/item-icon/item-icon.module';
import { ListModule } from '../../modules/list/list.module';
import { PermissionLevel } from '../../core/database/permissions/permission-level.enum';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { PageLoaderModule } from '../../modules/page-loader/page-loader.module';
import { EorzeanTimeService } from '../../core/eorzea/eorzean-time.service';
import { AlarmsFacade } from '../../core/alarms/+state/alarms.facade';
import { StepByStepComponent } from '../../modules/list/step-by-step-details/step-by-step-component';
import { ListDisplay } from '../../core/layout/list-display';

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
export class StepByStepListOverlayComponent extends StepByStepComponent {

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

  public stepsList$ = this.currentPath$.pipe(
    map(path => path.path.steps.slice(1))
  );

  constructor(protected eorzeaFacade: EorzeaFacade, protected ipc: IpcService,
              protected listsFacade: ListsFacade, protected layoutsFacade: LayoutsFacade,
              protected settings: SettingsService, protected lazyData: LazyDataFacade,
              protected mapService: MapService, protected etime: EorzeanTimeService, protected alarmsFacade: AlarmsFacade) {
    super(eorzeaFacade, ipc, listsFacade, layoutsFacade, settings, lazyData, mapService, etime, alarmsFacade);
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

  protected getDisplay(): Observable<ListDisplay> {
    return this.display$;
  }

  protected getMapId(): Observable<number> {
    return this.mapId$;
  }

  markStepAsDone(step: NavigationStep): void {
    this.listsFacade.setItemDone(step.itemId, step.iconid, step.finalItem, step.item_amount, null, step.total_item_amount);
  }
}
