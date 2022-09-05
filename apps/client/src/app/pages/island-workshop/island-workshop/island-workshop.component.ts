import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IpcService } from '../../../core/electron/ipc.service';
import { LocalStorageBehaviorSubject } from '../../../core/rxjs/local-storage-behavior-subject';
import { TeamcraftComponent } from '../../../core/component/teamcraft-component';
import { combineLatest, map, Observable, Subject, timer } from 'rxjs';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { withLazyData } from '../../../core/rxjs/with-lazy-data';
import { NzTableFilterFn, NzTableFilterList, NzTableSortFn, NzTableSortOrder } from 'ng-zorro-antd/table';
import { TranslateService } from '@ngx-translate/core';
import { TextQuestionPopupComponent } from '../../../modules/text-question-popup/text-question-popup/text-question-popup.component';
import { distinctUntilChanged, filter } from 'rxjs/operators';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { addDays, subDays } from 'date-fns';
import { CraftworksObject } from '../craftworks-object';
import { PlanningOptimizer } from '../planning-optimizer';

interface ColumnItem {
  name: string;
  sortOrder?: NzTableSortOrder | null;
  sortFn?: NzTableSortFn<any> | null;
  listOfFilter?: NzTableFilterList;
  filterFn?: NzTableFilterFn<any> | null;
  filterMultiple?: boolean;
  sortDirections?: NzTableSortOrder[];
}

@Component({
  selector: 'app-island-workshop',
  templateUrl: './island-workshop.component.html',
  styleUrls: ['./island-workshop.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IslandWorkshopComponent extends TeamcraftComponent {

  static POPULARITY_KEYS = {
    1: 'Very_high',
    2: 'High',
    3: 'Average',
    4: 'Low'
  };

  static DEMAND_SHIFT_KEYS = {
    0: 'Skyrocketing',
    1: 'Increasing',
    2: 'None',
    3: 'Decreasing',
    4: 'Plummeting'
  };

  static SUPPLY_KEYS = {
    0: 'Non_existant',
    1: 'Insufficient',
    2: 'Sufficient',
    3: 'Surplus',
    4: 'Overflowing'
  };

  public previousReset$ = timer(0, 1000).pipe(
    map(() => {
      // Only supports EU servers for now.
      let reset = new Date();
      reset.setUTCSeconds(0);
      reset.setUTCMinutes(0);
      reset.setUTCMilliseconds(0);
      if (reset.getUTCHours() < 8) {
        // This means the reset was yesterday
        reset = subDays(reset, 1);
      }
      reset.setUTCHours(8);
      return reset.getTime();
    }),
    distinctUntilChanged()
  );

  public nextReset$ = this.previousReset$.pipe(
    map(reset => {
      return addDays(new Date(reset), 1).getTime();
    })
  );

  public remainingHours$ = combineLatest([
    this.nextReset$,
    timer(0, 60000)
  ]).pipe(
    map(([reset]) => {
      return Math.floor((reset - Date.now()) / 3600000);
    }),
    distinctUntilChanged()
  );

  public supplies = Object.entries(IslandWorkshopComponent.SUPPLY_KEYS)
    .map(([value, label]) => ({ value: +value, label }));

  public demands = Object.entries(IslandWorkshopComponent.DEMAND_SHIFT_KEYS)
    .map(([value, label]) => ({ value: +value, label }));

  public now = Date.now();

  public editMode = false;

  public startOptimizer$ = new Subject<void>();

  public state$ = new LocalStorageBehaviorSubject('island:state', {
    popularity: -1,
    predictedPopularity: -1,
    supplyDemand: [],
    updated: 0
  });

  public tableColumns$: Observable<ColumnItem[]> = this.translate.get('ISLAND_SANCTUARY.WORKSHOP.POPULARITY.High').pipe(
    // Just a small trick to only compute all this once translations are loaded
    map(() => {
      return [
        {
          name: 'Product'
        },
        {
          name: 'Popularity',
          sortOrder: null,
          sortFn: (a, b) => a.popularity.id - b.popularity.id,
          listOfFilter: Object.entries<string>(IslandWorkshopComponent.POPULARITY_KEYS).map(([key, value]) => {
            return {
              value: +key,
              text: this.translate.instant(`ISLAND_SANCTUARY.WORKSHOP.POPULARITY.${value}`)
            };
          }),
          filterFn: (values, item) => values.some(value => item.popularity.id === value),
          filterMultiple: true
        },
        {
          name: 'Supply',
          sortOrder: null,
          sortFn: (a, b) => a.supply - b.supply,
          listOfFilter: Object.entries<string>(IslandWorkshopComponent.SUPPLY_KEYS).map(([key, value]) => {
            return {
              value: +key,
              text: this.translate.instant(`ISLAND_SANCTUARY.WORKSHOP.SUPPLY.${value}`)
            };
          }),
          filterFn: (values, item) => values.some(value => item.supply === value),
          filterMultiple: true
        },
        {
          name: 'Demand_shift',
          sortOrder: null,
          sortFn: (a, b) => a.demand - b.demand,
          listOfFilter: Object.entries<string>(IslandWorkshopComponent.DEMAND_SHIFT_KEYS).map(([key, value]) => {
            return {
              value: +key,
              text: this.translate.instant(`ISLAND_SANCTUARY.WORKSHOP.DEMAND_SHIFT.${value}`)
            };
          }),
          filterFn: (values, item) => values.some(value => item.demand === value),
          filterMultiple: true
        },
        {
          name: 'Predicted_popularity',
          sortOrder: null,
          sortFn: (a, b) => a.predictedPopularity.id - b.predictedPopularity.id,
          listOfFilter: Object.entries<string>(IslandWorkshopComponent.POPULARITY_KEYS).map(([key, value]) => {
            return {
              value: +key,
              text: this.translate.instant(`ISLAND_SANCTUARY.WORKSHOP.POPULARITY.${value}`)
            };
          }),
          filterFn: (values, item) => values.some(value => item.predictedPopularity.id === value),
          filterMultiple: true
        }
      ];
    })
  );

  public craftworksObjects$: Observable<CraftworksObject[]> = this.state$.pipe(
    withLazyData(this.lazyData, 'islandPopularity', 'islandCraftworks'),
    map(([state, islandPopularity, islandCraftworks]) => {
      const popularityEntry = islandPopularity[state.popularity];
      const predictedPopularityEntry = islandPopularity[state.predictedPopularity];
      return state.supplyDemand
        .filter(row => row.id > 0 && islandCraftworks[row.id].itemId > 0)
        .map(row => {
          const popularity = popularityEntry[row.id];
          const predictedPopularity = predictedPopularityEntry[row.id];
          return {
            ...row,
            itemId: islandCraftworks[row.id].itemId,
            craftworksEntry: islandCraftworks[row.id],
            supplyKey: IslandWorkshopComponent.SUPPLY_KEYS[row.supply],
            supplyIcon: new Array(row.supply).fill(null),
            demandKey: IslandWorkshopComponent.DEMAND_SHIFT_KEYS[row.demand],
            popularityKey: IslandWorkshopComponent.POPULARITY_KEYS[popularity.id],
            predictedPopularityKey: IslandWorkshopComponent.POPULARITY_KEYS[predictedPopularity.id],
            popularity,
            predictedPopularity
          };
        });
    })
  );

  public optimizerResult$ = combineLatest([
    this.craftworksObjects$,
    this.lazyData.getEntry('islandSupply'),
    this.startOptimizer$
  ]).pipe(
    map(([objects, supply]) => {
      return new PlanningOptimizer(objects, supply).run();
    })
  );

  public getExport = () => {
    return JSON.stringify(this.state$.value);
  };

  constructor(private ipc: IpcService, private lazyData: LazyDataFacade,
              public translate: TranslateService, private dialog: NzModalService,
              private message: NzMessageService) {
    super();
    this.ipc.islandWorkshopSupplyDemandPackets$.subscribe(packet => {
      this.state$.next({
        ...packet,
        updated: Date.now()
      });
    });
  }

  importState(): void {
    this.dialog.create({
      nzTitle: this.translate.instant('ISLAND_SANCTUARY.WORKSHOP.Import_state'),
      nzContent: TextQuestionPopupComponent,
      nzFooter: null
    }).afterClose
      .pipe(
        filter(res => res !== undefined)
      )
      .subscribe((data: string) => {
        this.state$.next(JSON.parse(data));
        this.message.success(this.translate.instant('ISLAND_SANCTUARY.WORKSHOP.State_imported'));
      });
  }

  setStateRowProperty(index: number, key: 'demand' | 'supply', value: number): void {
    const editedState = { ...this.state$.value };
    editedState.supplyDemand[index + 1][key] = value;
    this.state$.next(editedState);
  }
}
