import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SearchIndex, XivapiService } from '@xivapi/angular-client';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { BehaviorSubject, combineLatest, concat, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, first, map, mergeMap, shareReplay, switchMap, takeUntil, tap } from 'rxjs/operators';
import { GarlandToolsService } from '../../../core/api/garland-tools.service';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { ListPickerService } from '../../../modules/list-picker/list-picker.service';
import { ListsFacade } from '../../../modules/list/+state/lists.facade';
import { ListManagerService } from '../../../modules/list/list-manager.service';
import { List } from '../../../modules/list/model/list';
import { ProgressPopupService } from '../../../modules/progress-popup/progress-popup.service';
import { Levequest } from '../../../model/search/levequest';
import { DataService } from '../../../core/api/data.service';
import { AuthFacade } from '../../../+state/auth.facade';
import { TeamcraftComponent } from '../../../core/component/teamcraft-component';
import { SettingsService } from '../../../modules/settings/settings.service';
import { PlatformService } from '../../../core/tools/platform.service';
import { IpcService } from '../../../core/electron/ipc.service';
import { I18nName } from '../../../model/common/i18n-name';
import { EnvironmentService } from '../../../core/environment.service';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';

interface ExpObj {
  exp: number,
  level: number,
  totalExp: number
}

@Component({
  selector: 'app-levequests',
  templateUrl: './levequests.component.html',
  styleUrls: ['./levequests.component.less']
})
export class LevequestsComponent extends TeamcraftComponent implements OnInit {

  jobList = [8, 9, 10, 11, 12, 13, 14, 15, 18];

  job$: BehaviorSubject<number> = new BehaviorSubject<number>(null);

  query$: BehaviorSubject<string> = new BehaviorSubject<string>('');

  levelMin$: BehaviorSubject<number> = new BehaviorSubject<number>(this.environment.maxLevel - 10);

  levelMax$: BehaviorSubject<number> = new BehaviorSubject<number>(this.environment.maxLevel);

  results$: Observable<Levequest[]>;

  showIntro = true;

  loading = false;

  // Notification data
  itemsAdded = 0;

  modifiedList: List;

  allSelected = false;

  computeExp = false;

  globalExp = false;

  globalExpChange$ = new BehaviorSubject<boolean>(false);

  hideLarge = this.settings.hideLargeLeves;

  hideLargeChange$ = new BehaviorSubject<boolean>(this.settings.hideLargeLeves);

  roadToBuff = this.settings.roadToBuffLeves;

  roadToBuffChange$ = new BehaviorSubject<boolean>(this.settings.roadToBuffLeves);

  startingExp = 0;

  startingLevel = 1;

  maxLevel = this.environment.maxLevel;

  @ViewChild('notificationRef', { static: true })
  notification: TemplateRef<any>;

  constructor(private xivapi: XivapiService, private listsFacade: ListsFacade,
              private router: Router, private route: ActivatedRoute, private listManager: ListManagerService,
              private notificationService: NzNotificationService, private gt: GarlandToolsService,
              private i18n: I18nToolsService, private lazyData: LazyDataFacade,
              private listPicker: ListPickerService, private progressService: ProgressPopupService,
              private dataService: DataService, private auth: AuthFacade,
              private settings: SettingsService, private platformService: PlatformService, private ipc: IpcService,
              private environment: EnvironmentService) {
    super();
  }

  ngOnInit(): void {
    const res$ = combineLatest([this.query$, this.job$, this.levelMin$, this.levelMax$]).pipe(
      tap(([query]) => {
        this.router.navigate([], {
          queryParamsHandling: 'merge',
          queryParams: { query: query.length > 0 ? query : null },
          relativeTo: this.route
        });
      }),
      debounceTime(500),
      filter(([query, job, levelMin, levelMax]) => {
        return (query.length > 3 || job !== null) && levelMin <= levelMax;
      }),
      tap(() => {
        this.showIntro = false;
        this.loading = true;
        this.allSelected = false;
      }),
      switchMap(([query, job, levelMin, levelMax]) => {
        let filters;

        if (job) {
          filters = [{ column: 'ClassJobCategoryTargetID', operator: '=', value: +job + 1 }];
        } else {
          filters = [{ column: 'ClassJobCategoryTargetID', operator: '>=', value: 9 },
            { column: 'ClassJobCategoryTargetID', operator: '<=', value: 16 }];
        }

        filters.push({ column: 'ClassJobLevel', operator: '>=', value: levelMin },
          { column: 'ClassJobLevel', operator: '<=', value: levelMax });

        return this.xivapi.search({
          indexes: [SearchIndex.LEVE], string: query, filters: filters,
          columns: ['LevelLevemete.Map.ID', 'CraftLeve.Item0TargetID', 'CraftLeve.Item0.Icon',
            'CraftLeve.ItemCount0', 'CraftLeve.ItemCount1', 'CraftLeve.ItemCount2', 'CraftLeve.ItemCount3',
            'CraftLeve.Repeats', 'Name_*', 'GilReward', 'ExpReward', 'ClassJobCategoryTargetID', 'ClassJobLevel',
            'LevelLevemete.Map.PlaceNameTargetID', 'LevelLevemete.Y', 'PlaceNameStart.ID', 'ID', 'AllowanceCost'],
          // 105 is the amount of leves from 1 to 70 for a single job
          limit: 105
        });
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    );

    this.results$ = combineLatest([this.globalExpChange$, res$, this.hideLargeChange$, this.roadToBuffChange$]).pipe(
      map(([globalExp, list, hideLarge, roadToBuff]) => {
        this.settings.hideLargeLeves = hideLarge;
        const results: Levequest[] = [];
        (<any>list).Results.forEach(leve => {
          results.push({
            id: leve.ID,
            level: leve.ClassJobLevel,
            jobId: leve.ClassJobCategoryTargetID - 1,
            itemId: leve.CraftLeve.Item0TargetID,
            exp: leve.ExpReward * (roadToBuff ? 2 : 1),
            gil: leve.GilReward * (roadToBuff ? 2 : 1),
            hq: this.settings.alwaysHQLeves && leve.ClassJobCategoryTargetID - 1 !== 18,
            allDeliveries: this.settings.alwaysAllDeliveries,
            amount: globalExp ? 0 : 1,
            itemQuantity: leve.CraftLeve.ItemCount0
              + leve.CraftLeve.ItemCount1
              + leve.CraftLeve.ItemCount2
              + leve.CraftLeve.ItemCount3,
            startPlaceId: leve.PlaceNameStart.ID,
            deliveryPlaceId: leve.LevelLevemete.Map.PlaceNameTargetID,
            repeats: leve.CraftLeve.Repeats,
            allowanceCost: leve.AllowanceCost
          });
        });

        return results.sort((a, b) => {
          if (a.jobId === b.jobId) {
            return a.level - b.level;
          } else {
            return a.jobId - b.jobId;
          }
        }).filter((a) => {
          return !hideLarge || a.allowanceCost === 1;
        });
      }),
      tap(() => this.loading = false)
    );

    combineLatest([this.auth.gearSets$, this.job$]).pipe(
      distinctUntilChanged(([, a], [, b]) => a === b),
      map(([sets, job]) => {
        return sets.find(set => set.jobId === job);
      }),
      filter(set => set !== undefined),
      map(set => set.level),
      takeUntil(this.onDestroy$)
    ).subscribe(level => {
      this.startingLevel = level;
    });

    this.route.queryParams
      .subscribe(params => {
        this.query$.next(params.query || '');
        this.job$.next(+params.job ? +params.job : null);
        this.levelMin$.next(+params.min || this.environment.maxLevel - 10);
        this.levelMax$.next(+params.max || this.environment.maxLevel);
      });
  }

  public getMaxExp(level: number): number {
    return this.gt.getMaxXp(level);
  }

  public setJob(value: number): void {
    this.job$.next(value);

    this.router.navigate([], {
      queryParamsHandling: 'merge',
      queryParams: { job: value },
      relativeTo: this.route
    });
  }

  public setLevel(subject: BehaviorSubject<number>, value: number): void {
    subject.next(value);

    this.router.navigate([], {
      queryParamsHandling: 'merge',
      queryParams: { min: this.levelMin$.value, max: this.levelMax$.value },
      relativeTo: this.route
    });
  }

  public addLevesToList(leves: Levequest[]): void {
    this.listPicker.pickList().pipe(
      mergeMap(list => {
        const operation$ = concat(
          ...leves.map(leve => {
            return this.dataService.getItem(leve.itemId).pipe(
              switchMap(itemData => {
                if (itemData.isCraft()) {
                  const craft = itemData.item.craft.find(c => c.job === leve.jobId);
                  return this.listManager.addToList({
                    itemId: leve.itemId,
                    list: list,
                    recipeId: craft.id,
                    amount: leve.itemQuantity * this.craftAmount(leve)
                  });
                } else {
                  return this.listManager.addToList({
                    itemId: leve.itemId,
                    list: list,
                    recipeId: null,
                    amount: leve.itemQuantity * this.craftAmount(leve)
                  });
                }
              })
            );
          })
        );
        return this.progressService.showProgress(operation$, leves.length, 'Adding_recipes',
          { amount: leves.length, listname: list.name });
      }),
      tap(list => list.$key ? this.listsFacade.updateList(list) : this.listsFacade.addList(list)),
      mergeMap(list => {
        // We want to get the list created before calling it a success, let's be pessimistic !
        return this.listsFacade.myLists$.pipe(
          map(lists => lists.find(l => l.createdAt.seconds === list.createdAt.seconds && l.$key !== undefined)),
          filter(l => l !== undefined),
          first()
        );
      })
    ).subscribe((list) => {
      this.itemsAdded = leves.length;
      this.modifiedList = list;
      this.notificationService.template(this.notification);
    });
  }

  public createQuickList(leve: Levequest): void {
    this.i18n.getNameObservable('items', leve.itemId).pipe(
      first(),
      switchMap(itemName => {
        const list = this.listsFacade.newEphemeralList(itemName);

        const operation$ = this.dataService.getItem(leve.itemId).pipe(
          switchMap(itemData => {
            const craft = itemData.item.craft.find(c => c.job === leve.jobId);
            return this.listManager
              .addToList({
                itemId: leve.itemId,
                list: list,
                recipeId: craft.id,
                amount: leve.itemQuantity * this.craftAmount(leve)
              })
              .pipe(
                tap(resultList => this.listsFacade.addList(resultList)),
                mergeMap(resultList => {
                  return this.listsFacade.myLists$.pipe(
                    map(lists => lists.find(l => l.createdAt.seconds === resultList.createdAt.seconds && l.$key !== undefined)),
                    filter(l => l !== undefined),
                    first()
                  );
                })
              );
          })
        );

        return this.progressService.showProgress(operation$, 1);
      })
    ).subscribe((newList) => {
      this.router.navigate(['list', newList.$key]);
    });
  }

  public getExp(leve: Levequest, allLeves: Levequest[]): { level: number, exp: number, expPercent: number, totalExp: number } {
    let expObj = {
      level: this.startingLevel,
      exp: this.startingExp,
      totalExp: 0
    };
    if (this.globalExp) {
      allLeves.forEach(globalLeve => {
        expObj = this.applyLeveExp(expObj, globalLeve);
      });
    } else {
      expObj = this.applyLeveExp(expObj, leve);
    }
    return {
      level: expObj.level,
      expPercent: Math.min(100, Math.floor(100 * expObj.exp / this.getMaxExp(expObj.level))),
      exp: Math.min(expObj.exp, this.getMaxExp(expObj.level)),
      totalExp: expObj.totalExp
    };
  }

  public getLeveExp(leve: Levequest, allLeves: Levequest[]): number {
    return this.getExp(leve, allLeves).totalExp;
  }

  public getLeveGil(leve: Levequest): number {
    const res = leve.gil * this.craftAmount(leve);
    return leve.hq ? res * 2 : res;
  }

  public addSelectedLevesToList(leves: Levequest[]): void {
    this.addLevesToList(leves.filter(leve => leve.selected));
  }

  public selectAll(leves: Levequest[], selected: boolean): void {
    leves.forEach(leve => leve.selected = selected);
  }

  public updateAllSelected(leves: Levequest[]): void {
    this.allSelected = leves.reduce((res, item) => item.selected && res, true);
  }

  public openInGE(leveName: I18nName): void {
    if (this.platformService.isDesktop()) {
      this.ipc.send('open-link', `https://ffxiv.gamerescape.com/wiki/${leveName.en.split(' ').join('_')}`);
    }
  }

  trackByLeve(index: number, leve: Levequest): number {
    return leve.id;
  }

  private applyLeveExp(expObj: ExpObj, leve: Levequest): ExpObj {
    for (let repeat = 0; repeat < leve.amount; repeat++) {
      for (let i = 0; i < (leve.allDeliveries ? leve.repeats + 1 : 1); i++) {
        let leveExp = leve.exp;
        if (leve.hq) {
          leveExp *= 2;
        }
        if (leve.level < 80 && expObj.level >= 80) {
          leveExp = 1000;
        }
        expObj = {
          ...this.applyExp(expObj.exp || 0, expObj.level, leveExp),
          totalExp: expObj.totalExp + leveExp
        };
      }
    }
    return expObj;
  }

  private applyExp(exp: number, level: number, expToAdd: number): { exp: number, level: number } {
    exp += expToAdd;
    while (exp - this.getMaxExp(level) >= 0 && level < this.maxLevel - 1) {
      exp -= this.getMaxExp(level);
      level++;
    }
    // Handle special case for max level
    if (exp >= this.getMaxExp(level) && level >= this.maxLevel - 1) {
      level = this.maxLevel;
      exp = 0;
    }
    return {
      exp,
      level
    };
  }

  private craftAmount(leve: Levequest): number {
    return leve.amount * (leve.allDeliveries ? leve.repeats + 1 : 1);
  }
}
