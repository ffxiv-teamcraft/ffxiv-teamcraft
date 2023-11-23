import { ChangeDetectionStrategy, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { observeInput } from '../../../core/rxjs/observe-input';
import { combineLatest, map, Observable } from 'rxjs';
import { StepByStepList } from './model/step-by-step-list';
import { ListDisplay } from '../../../core/layout/list-display';
import { DataType } from '@ffxiv-teamcraft/types';
import { PermissionLevel } from '../../../core/database/permissions/permission-level.enum';
import { distinctUntilChanged, filter, switchMap, takeUntil, withLatestFrom } from 'rxjs/operators';
import { SettingsService } from '../../settings/settings.service';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { LayoutRowOrder } from '../../../core/layout/layout-row-order.enum';
import { MapService } from '../../map/map.service';
import { PlatformService } from '../../../core/tools/platform.service';
import { IpcService } from '../../../core/electron/ipc.service';
import { EorzeaFacade } from '../../eorzea/+state/eorzea.facade';
import { StepByStepComponent } from './step-by-step-component';
import { ListsFacade } from '../+state/lists.facade';
import { LayoutsFacade } from '../../../core/layout/+state/layouts.facade';
import { EorzeanTimeService } from '../../../core/eorzea/eorzean-time.service';
import { AlarmsFacade } from '../../../core/alarms/+state/alarms.facade';
import { LayoutOrderService } from '../../../core/layout/layout-order.service';
import { ListRow } from '../model/list-row';
import { MapNamePipe } from '../../../pipes/pipes/map-name.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { I18nPipe } from '../../../core/i18n.pipe';
import { StepByStepRowComponent } from '../step-by-step-row/step-by-step-row.component';
import { LazyScrollComponent } from '../../lazy-scroll/lazy-scroll/lazy-scroll.component';
import { NzCardModule } from 'ng-zorro-antd/card';
import { StepByStepDatatypeComponent } from '../step-by-step-datatype/step-by-step-datatype.component';
import { MapComponent } from '../../map/map/map.component';
import { NzWaveModule } from 'ng-zorro-antd/core/wave';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { FormsModule } from '@angular/forms';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NgIf, NgFor, AsyncPipe, LowerCasePipe } from '@angular/common';

@Component({
    selector: 'app-step-by-step-details',
    templateUrl: './step-by-step-details.component.html',
    styleUrls: ['./step-by-step-details.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NgIf, NzGridModule, NzProgressModule, NzSelectModule, FormsModule, NgFor, NzButtonModule, NzIconModule, NzWaveModule, MapComponent, StepByStepDatatypeComponent, NzCardModule, LazyScrollComponent, StepByStepRowComponent, AsyncPipe, LowerCasePipe, I18nPipe, TranslateModule, MapNamePipe]
})
export class StepByStepDetailsComponent extends StepByStepComponent implements OnInit {
  DataType = DataType;

  @Input()
  display: ListDisplay;

  @Input()
  permissionLevel: PermissionLevel;

  navigationStatus$: Observable<any>;

  sortedAlarms$: Observable<ListRow[]>;

  public containerRef: ElementRef;

  @ViewChild('container', { static: false })
  public set _containerRef(ref: ElementRef) {
    setTimeout(() => {
      this.containerRef = ref;
    }, 500);
  }

  public isDesktop = this.platformService.isDesktop();

  constructor(protected eorzeaFacade: EorzeaFacade, protected ipc: IpcService,
              protected listsFacade: ListsFacade, protected layoutsFacade: LayoutsFacade,
              public settings: SettingsService, protected lazyData: LazyDataFacade,
              protected mapService: MapService, protected etime: EorzeanTimeService, protected alarmsFacade: AlarmsFacade,
              private platformService: PlatformService, private layoutOrderService: LayoutOrderService) {
    super(eorzeaFacade, ipc, listsFacade, layoutsFacade, settings, lazyData, mapService, etime, alarmsFacade);
  }

  protected onNewStepByStep(list: StepByStepList) {
    if (!list.steps[this.selectedMap$.value] && list.maps.length > 0) {
      const nextIncompleteMap = list.maps.find(mapId => !list.steps[mapId].complete);
      this.selectedMap$.next(nextIncompleteMap || 0);
    }
  }

  trackById(index: number, item: { id: number }): number {
    return item.id;
  }

  trackByMapId(index: number, mapId: number): number {
    return mapId;
  }

  protected getDisplay(): Observable<ListDisplay> {
    return observeInput(this, 'display');
  }

  protected getMapId(): Observable<number> {
    return this.selectedMap$;
  }

  ngOnInit() {
    super.ngOnInit();
    this.sortedAlarms$ = this.stepByStep$.pipe(
      map(list => list.alarms),
      filter(alarms => alarms.length > 0),
      switchMap(alarms => {
        return this.layoutOrderService.order(alarms, 'TIMER', LayoutRowOrder.ASC);
      })
    );

    this.navigationStatus$ = combineLatest([this.stepByStep$, this.selectedMap$]).pipe(
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

    this.eorzeaFacade.mapId$.pipe(distinctUntilChanged()).pipe(
      withLatestFrom(this.stepByStep$),
      takeUntil(this.onDestroy$)
    ).subscribe(([mapId, list]) => {
      if (list.maps.includes(mapId)) {
        this.selectedMap$.next(mapId);
      }
    });
  }
}
