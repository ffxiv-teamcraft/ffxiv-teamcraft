import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
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

import { EorzeanTimeService } from '../../core/eorzea/eorzean-time.service';
import { AlarmsFacade } from '../../core/alarms/+state/alarms.facade';
import { StepByStepComponent } from '../../modules/list/step-by-step-details/step-by-step-component';
import { ListDisplay } from '../../core/layout/list-display';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { uniqBy } from 'lodash';
import { PageLoaderComponent } from '../../modules/page-loader/page-loader/page-loader.component';

@Component({
  selector: 'app-step-by-step-list-overlay',
  standalone: true,
  imports: [CommonModule, OverlayContainerModule, MapModule, PipesModule, CoreModule, FullpageMessageModule,
    NzListModule, ItemIconModule, ListModule,
    NzDividerModule, NzBreadCrumbModule, NzEmptyModule, NzGridModule, PageLoaderComponent],
  templateUrl: './step-by-step-list-overlay.component.html',
  styleUrls: ['./step-by-step-list-overlay.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StepByStepListOverlayComponent extends StepByStepComponent implements OnInit {

  public mapId$ = this.eorzeaFacade.mapId$.pipe(
    tap(() => this.loading = true)
  );

  public list$ = this.listsFacade.selectedList$;

  private adaptativeFilter$ = new BehaviorSubject<boolean>(localStorage.getItem('adaptative-filter') === 'true');

  public permissionLevel$: Observable<PermissionLevel> = this.listsFacade.selectedListPermissionLevel$;

  private display$ = combineLatest([this.list$, this.adaptativeFilter$]).pipe(
    switchMap(([list, adaptativeFilter]) => {
      return this.layoutsFacade.getDisplay(list, adaptativeFilter, false, this.layoutsFacade.selectedLayout$, true);
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  public closestMap$: Observable<number>;

  public stepsList$: Observable<NavigationStep[]>;

  public noListSelected = true;

  protected override overlay = true;

  constructor(protected eorzeaFacade: EorzeaFacade, protected ipc: IpcService,
              protected listsFacade: ListsFacade, protected layoutsFacade: LayoutsFacade,
              protected settings: SettingsService, protected lazyData: LazyDataFacade,
              protected mapService: MapService, protected etime: EorzeanTimeService, protected alarmsFacade: AlarmsFacade) {
    super(eorzeaFacade, ipc, listsFacade, layoutsFacade, settings, lazyData, mapService, etime, alarmsFacade);
    this.layoutsFacade.loadAll();
    this.ipc.send('overlay:pcap', { enabled: true, url: '/step-by-step-list-overlay' });
    this.ipc.mainWindowState$.pipe(
      filter(state => {
        return state.lists && state.layouts;
      })
    ).subscribe((state) => {
      this.noListSelected = !state.lists.selectedId;
      if (state.lists.selectedId) {
        this.listsFacade.overlayListsLoaded(Object.values<List>(state.lists.listDetails.entities).filter(list => list.$key === state.lists.selectedId));
        this.listsFacade.select(state.lists.selectedId);
        this.layoutsFacade.selectFromOverlay(state.layouts.selectedId);
      }
    });
  }

  protected getDisplay(): Observable<ListDisplay> {
    return this.display$;
  }

  protected getMapId(): Observable<number> {
    return this.mapId$;
  }

  ngOnInit() {
    super.ngOnInit();
    this.stepsList$ = this.currentPath$.pipe(
      map(path => uniqBy(path.path.steps.slice(1), 'itemId'))
    );
    this.closestMap$ = combineLatest([this.stepByStep$, this.mapId$]).pipe(
      map(([stepByStep, currentMapId]) => {
        if (stepByStep.maps.length === 0) {
          return -1;
        }
        return stepByStep.maps.filter(mapId => {
          return mapId !== currentMapId && stepByStep.steps[mapId].progress < 100;
        })[0];
      })
    );
  }
}
