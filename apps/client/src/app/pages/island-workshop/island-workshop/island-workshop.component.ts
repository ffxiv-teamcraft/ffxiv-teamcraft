import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IpcService } from '../../../core/electron/ipc.service';
import { LocalStorageBehaviorSubject } from '../../../core/rxjs/local-storage-behavior-subject';
import { TeamcraftComponent } from '../../../core/component/teamcraft-component';
import { combineLatest, EMPTY, map, Observable, of, timer } from 'rxjs';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { withLazyData } from '../../../core/rxjs/with-lazy-data';
import { NzTableFilterFn, NzTableFilterList, NzTableSortFn, NzTableSortOrder } from 'ng-zorro-antd/table';
import { TranslateService } from '@ngx-translate/core';
import { TextQuestionPopupComponent } from '../../../modules/text-question-popup/text-question-popup/text-question-popup.component';
import { catchError, distinctUntilChanged, filter, retry, switchMap } from 'rxjs/operators';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { subDays } from 'date-fns';
import { CraftworksObject } from '../craftworks-object';
import { IslandWorkshopStatusService } from '../../../core/database/island-workshop-status.service';
import { PlatformService } from '../../../core/tools/platform.service';
import { WorkshopStatusData } from '../workshop-status-data';
import { SettingsService } from '../../../modules/settings/settings.service';
import { WorkshopPattern, workshopPatterns } from '../workshop-patterns';
import { PlanningFormulaOptimizer } from '../optimizer/planning-formula-optimizer';
import { DataType, getExtract, getItemSource } from '@ffxiv-teamcraft/types';
import { AuthFacade } from '../../../+state/auth.facade';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { EnvironmentService } from '../../../core/environment.service';

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

  days = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday'
  ];

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

  public previousWeeklyReset$ = timer(0, 1000).pipe(
    map(() => {
      let previousWeeklyReset = new Date();
      previousWeeklyReset.setUTCSeconds(0);
      previousWeeklyReset.setUTCMinutes(0);
      previousWeeklyReset.setUTCMilliseconds(0);
      if (previousWeeklyReset.getUTCDay() === 2 && previousWeeklyReset.getUTCHours() < 8) {
        previousWeeklyReset = subDays(previousWeeklyReset, 7);
      } else {
        while (previousWeeklyReset.getUTCDay() !== 2) {
          previousWeeklyReset = subDays(previousWeeklyReset, 1);
        }
      }
      previousWeeklyReset.setUTCHours(8);
      return previousWeeklyReset.getTime();
    }),
    distinctUntilChanged()
  );

  public supplies = Object.entries(IslandWorkshopComponent.SUPPLY_KEYS)
    .map(([value, label]) => ({ value: +value, label }));

  public demands = Object.entries(IslandWorkshopComponent.DEMAND_SHIFT_KEYS)
    .map(([value, label]) => ({ value: +value, label }));

  public now = Date.now();

  public editMode = false;

  public state$ = new LocalStorageBehaviorSubject('island:state', {
    popularity: -1,
    predictedPopularity: -1,
    supplyDemand: [],
    updated: 0,
    edited: false
  });

  public stateIsOutdated$ = combineLatest([
    this.state$,
    this.previousReset$
  ]).pipe(
    map(([state, reset]) => state.updated < reset)
  );

  public islandLevel$ = new LocalStorageBehaviorSubject<number>('island-workshop:level', 1);

  public landmarks$ = new LocalStorageBehaviorSubject<number>('island-workshop:landmarks', 0);

  public rank$ = new LocalStorageBehaviorSubject<number>('island-workshop:rank', 1);

  public excludePastureMaterials$ = new LocalStorageBehaviorSubject<boolean>('island-workshop:exclude_pasture', false);

  public excludeCropMaterials$ = new LocalStorageBehaviorSubject<boolean>('island-workshop:exclude_crops', false);

  public displayItemMetadata$ = new LocalStorageBehaviorSubject<boolean>('island-workshop:display_item_metadata', false);

  public tableColumns$: Observable<ColumnItem[]> = combineLatest([
    this.translate.get('ISLAND_SANCTUARY.WORKSHOP.POPULARITY.High'),
    this.lazyData.getI18nEntry('islandCraftworksTheme')
  ]).pipe(
    // Just a small trick to only compute all this once translations are loaded
    map(([, themes]) => {
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
          name: 'Possible_peak_days',
          listOfFilter: new Array(7).fill(null).map((_, i) => {
            const day = this.days[i];
            return {
              value: i,
              text: this.translate.instant(`COMMON.DAYS.${day}`)
            };
          }),
          filterFn: (values, item) => values.some(value => item.patterns.some(p => p.day === value)),
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
        },
        {
          name: 'Crafting_time',
          sortOrder: null,
          sortFn: (a, b) => a.craftworksEntry.craftingTime - b.craftworksEntry.craftingTime,
          listOfFilter: [4, 6, 8].map(time => {
            return {
              value: time,
              text: `${time}h`
            };
          }),
          filterFn: (values, item) => values.some(value => item.craftworksEntry.craftingTime === value),
          filterMultiple: true
        },
        {
          name: 'Categories',
          listOfFilter: Object.keys(themes).map(key => {
            return {
              value: +key,
              text: this.i18n.getName(themes[key])
            };
          }),
          filterFn: (values, item) => values.some(value => item.craftworksEntry.themes.includes(value)),
          filterMultiple: true
        }
      ];
    })
  );

  private stateHistory$ = combineLatest([this.previousWeeklyReset$, this.settings.region$]).pipe(
    switchMap(([reset]) => {
      const historyEntriesToFetch = [reset.toString()];
      let nextDay = reset + 86400000;
      while (nextDay < Date.now()) {
        historyEntriesToFetch.push(nextDay.toString());
        nextDay += 86400000;
      }
      return combineLatest(historyEntriesToFetch.map(date => {
        return this.mjiWorkshopStatusService.get(date).pipe(
          catchError(() => of(null))
        );
      })).pipe(
        map(history => history.filter(h => h !== null))
      );
    })
  );

  public today$ = this.stateHistory$.pipe(
    map(history => history.length - 1)
  );

  public craftworksObjects$: Observable<CraftworksObject[]> = combineLatest([
    this.state$,
    this.islandLevel$,
    this.stateHistory$,
    this.excludePastureMaterials$,
    this.excludeCropMaterials$
  ]).pipe(
    withLazyData(this.lazyData, 'islandPopularity', 'islandCraftworks', 'recipes', 'extracts'),
    map(([[state, islandLevel, history, excludePasture, excludeCrops], islandPopularity, islandCraftworks, recipes, extracts]) => {
      const popularityEntry = islandPopularity[state.popularity];
      const predictedPopularityEntry = islandPopularity[state.predictedPopularity];
      return state.supplyDemand
        .filter(row => {
          const maxId = this.environment.gameVersion < 6.3 ? 50 : Infinity;
          return row.id > 0 && row.id <= maxId && islandCraftworks[row.id]?.itemId > 0
        })
        .filter(row => {
          let matches = true;
          if (excludePasture || excludeCrops) {
            const recipe = recipes.find(r => r.id === `mji-craftworks-${row.id}`);
            if (excludePasture) {
              matches = matches && recipe.ingredients.every(i => getItemSource(getExtract(extracts, i.id), DataType.ISLAND_PASTURE)?.length === 0);
            }
            if (excludeCrops) {
              matches = matches && recipe.ingredients.every(i => getItemSource(getExtract(extracts, i.id), DataType.ISLAND_CROP, true).seed === undefined);
            }
          }
          return matches;
        })
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
        })
        .filter(row => row.craftworksEntry.lvl <= islandLevel)
        .map(item => {
          item.patterns = this.findPatterns(history, item);
          return item;
        });
    })
  );

  public optimizerResult$ = combineLatest([
    this.craftworksObjects$,
    this.lazyData.getEntry('islandSupply'),
    this.landmarks$,
    this.rank$,
    this.settings.watchSetting<number>('island-workshop:rest-day', this.settings.islandWorkshopRestDay),
    this.today$,
    this.stateHistory$
  ]).pipe(
    filter(([objects]) => objects.length > 0),
    map(([objects, supply, landmarks, rank, secondRestDay, today, history]) => {
      try {
        return new PlanningFormulaOptimizer(objects, history, 3, landmarks, rank, supply, secondRestDay, today).run();
      } catch (e) {
        return {
          planning: null,
          score: 0
        };
      }
    })
  );

  public onlineState$ = combineLatest([this.previousReset$, this.settings.region$]).pipe(
    switchMap(([reset]) => {
      return this.mjiWorkshopStatusService.get(reset.toString()).pipe(
        retry({
          count: 60,
          delay: 60000
        }),
        catchError(() => of({ objects: [] }))
      );
    })
  );

  public nextWeekPrep$ = this.state$.pipe(
    map(state => state.predictedPopularity),
    distinctUntilChanged(),
    withLazyData(this.lazyData, 'islandPopularity', 'islandCraftworks', 'recipes', 'extracts'),
    map(([popularity, islandPopularity, objects, recipes, extracts]) => {
      const registry = Object.entries(objects)
        .filter(([id]) => {
          return islandPopularity[popularity] && islandPopularity[popularity][id].ratio >= 120;
        })
        .reduce((acc, [id, obj]) => {
          const recipe = recipes.find(r => r.id === `mji-craftworks-${id}`);
          const possibleCrafts = Math.floor(24 / (obj.craftingTime + 4));
          recipe.ingredients.forEach(i => {
            const pastureData = getItemSource(getExtract(extracts, i.id), DataType.ISLAND_PASTURE);
            const cropData = getItemSource(getExtract(extracts, i.id), DataType.ISLAND_CROP);
            if (pastureData?.length > 0) {
              // possibleCrafts crafts per day max, with 3 workshops
              acc.pasture[i.id] = (acc.pasture[i.id] || 0) + i.amount * possibleCrafts * 3;
            }
            if (cropData.seed) {
              // possibleCrafts crafts per day max, with 3 workshops
              acc.crops[i.id] = (acc.crops[i.id] || 0) + i.amount * possibleCrafts * 3;
            }
          });
          return acc;
        }, { pasture: {}, crops: {} });
      return {
        pasture: Object.entries(registry.pasture).map(([id, quantity]) => ({ id, quantity })),
        crops: Object.entries(registry.crops).map(([id, quantity]) => ({ id, quantity }))
      };
    })
  );

  public machinaToggle = false;

  public getExport = () => {
    return JSON.stringify(this.state$.value);
  };

  constructor(private ipc: IpcService, private lazyData: LazyDataFacade,
              public translate: TranslateService, private dialog: NzModalService,
              private message: NzMessageService, private mjiWorkshopStatusService: IslandWorkshopStatusService,
              public platformService: PlatformService, public settings: SettingsService,
              private authFacade: AuthFacade, private i18n: I18nToolsService,
              private environment: EnvironmentService) {
    super();

    if (this.platformService.isDesktop()) {
      this.ipc.on('toggle-machina:value', (event, value) => {
        this.machinaToggle = value;
      });
      this.ipc.send('toggle-machina:get');
      combineLatest([this.previousReset$, this.state$, this.authFacade.user$]).pipe(
        switchMap(([reset, state, user]) => {
          return this.mjiWorkshopStatusService.get(reset.toString()).pipe(
            map((historyEntry) => {
              const shouldUpdate = user.admin ||
                (!historyEntry.lock
                  && !state.edited
                  && historyEntry.objects.some((obj, i) => {
                    return state.supplyDemand[i].supply < obj.supply;
                  })
                  && !state.supplyDemand.some(entry => entry.supply > 3)
                  && !state.supplyDemand.every(entry => entry.supply === 0 && entry.demand === 0));
              return {
                shouldUpdate,
                historyEntry
              };
            }),
            catchError(() => {
              return of({ shouldUpdate: true, historyEntry: null });
            }),
            switchMap(({ shouldUpdate, historyEntry }) => {
              if (shouldUpdate && state.updated >= reset) {
                let supplyDemand = state.supplyDemand;
                if (historyEntry) {
                  supplyDemand = historyEntry.objects.map((historyRow, i) => {
                    const stateRow = state.supplyDemand[i];
                    // If supply is >= 3, it's probably a missing item, just return history row (and fallback if it's undefined).
                    if (stateRow.supply >= 3) {
                      return historyRow || stateRow;
                    }
                    // Pick the row that has the lowest supply
                    return stateRow.supply > historyRow.supply ? historyRow : stateRow;
                  });
                }
                return this.mjiWorkshopStatusService.set(reset.toString(), {
                  objects: supplyDemand,
                  popularity: state.popularity,
                  predictedPopularity: state.predictedPopularity,
                  start: reset,
                  lock: user.admin
                });
              }
              return EMPTY;
            })
          );
        })
      ).subscribe();
      this.ipc.islandWorkshopSupplyDemandPackets$.subscribe(packet => {
        this.state$.next({
          ...packet,
          updated: Date.now(),
          edited: false
        });
      });
    }
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
        this.state$.next({ ...JSON.parse(data), edited: true });
        this.message.success(this.translate.instant('ISLAND_SANCTUARY.WORKSHOP.State_imported'));
      });
  }

  importOnlineState(state: WorkshopStatusData): void {
    this.state$.next({
      popularity: state.popularity,
      predictedPopularity: state.predictedPopularity,
      supplyDemand: state.objects,
      updated: +state.$key,
      edited: false
    });
  }

  setStateRowProperty(index: number, key: 'demand' | 'supply', value: number): void {
    const editedState = { ...this.state$.value };
    editedState.supplyDemand[index + 1][key] = value;
    editedState.edited = true;
    this.state$.next(editedState);
  }

  private findPatterns(history: WorkshopStatusData[], item: CraftworksObject): { index: number, pattern: WorkshopPattern }[] {
    const itemHistory = history.map(day => {
      return [day.objects[item.id].supply, day.objects[item.id].demand];
    });
    let matches = workshopPatterns.map((pattern, i) => ({ pattern, i }));
    for (let index = 0; index < itemHistory.length; index++) {
      if (matches.length === 1) {
        break;
      }
      matches = matches.filter(({ pattern, i }) => {
        const patternEntry = pattern[index];
        const day = itemHistory[index];
        return Math.min(day[0], 2) === patternEntry[0]
          && (
            patternEntry[1] === -1
            || (patternEntry[1] === -2 && day[1] !== 1)
            || day[1] === patternEntry[1]
          );
      });
    }
    return matches.map(({ pattern, i }) => {
      return { day: (3 + Math.floor(i / 2)) % 7, index: 1 + Math.floor(i / 2), pattern, strong: i % 2 === 1 };
    });
  }

  trackByRow(index: number, row: { id: number, supply: number, demand: number }): string {
    return `${row.id}:${row.supply}:${row.demand}`;
  }
}
