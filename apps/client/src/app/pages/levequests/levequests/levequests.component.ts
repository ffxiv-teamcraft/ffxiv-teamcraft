import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SearchIndex, XivapiService } from '@xivapi/angular-client';
import { NzNotificationService } from 'ng-zorro-antd';
import { BehaviorSubject, combineLatest, concat, Observable } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  first,
  map,
  mergeMap,
  shareReplay,
  switchMap,
  takeUntil,
  tap
} from 'rxjs/operators';
import { GarlandToolsService } from '../../../core/api/garland-tools.service';
import { LocalizedDataService } from '../../../core/data/localized-data.service';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { ListPickerService } from '../../../modules/list-picker/list-picker.service';
import { ListsFacade } from '../../../modules/list/+state/lists.facade';
import { ListManagerService } from '../../../modules/list/list-manager.service';
import { List } from '../../../modules/list/model/list';
import { ProgressPopupService } from '../../../modules/progress-popup/progress-popup.service';
import { Levequest } from '../../../model/search/levequest';
import { DataService } from '../../../core/api/data.service';
import { LazyDataService } from '../../../core/data/lazy-data.service';
import { AuthFacade } from '../../../+state/auth.facade';
import { TeamcraftComponent } from '../../../core/component/teamcraft-component';
import { SettingsService } from '../../../modules/settings/settings.service';

@Component({
  selector: 'app-levequests',
  templateUrl: './levequests.component.html',
  styleUrls: ['./levequests.component.less']
})
export class LevequestsComponent extends TeamcraftComponent implements OnInit {

  jobList: any[] = [];

  job$: BehaviorSubject<number> = new BehaviorSubject<number>(null);

  query$: BehaviorSubject<string> = new BehaviorSubject<string>('');

  levelMin$: BehaviorSubject<number> = new BehaviorSubject<number>(1);

  levelMax$: BehaviorSubject<number> = new BehaviorSubject<number>(10);

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

  startingExp = 0;

  startingLevel = 1;

  @ViewChild('notificationRef', { static: true })
  notification: TemplateRef<any>;

  constructor(private xivapi: XivapiService, private listsFacade: ListsFacade,
              private router: Router, private route: ActivatedRoute, private listManager: ListManagerService,
              private notificationService: NzNotificationService, private gt: GarlandToolsService,
              private l12n: LocalizedDataService, private i18n: I18nToolsService,
              private listPicker: ListPickerService, private progressService: ProgressPopupService,
              private dataService: DataService, private lazyData: LazyDataService,
              private auth: AuthFacade, private settings: SettingsService) {
    super();
    this.jobList = this.gt.getJobs().slice(8, 16).concat([this.gt.getJob(18)]);
  }

  ngOnInit(): void {
    const res$ = this.query$.pipe(
      tap(query => {
        this.router.navigate([], {
          queryParamsHandling: 'merge',
          queryParams: { query: query.length > 0 ? query : null },
          relativeTo: this.route
        });
      }),
      debounceTime(500),
      filter((query) => (query.length > 3 || this.job$.value !== null) && this.levelMin$.value <= this.levelMax$.value),
      tap(() => {
        this.showIntro = false;
        this.loading = true;
        this.allSelected = false;
      }),
      switchMap(query => {
        let filters;

        if (this.job$.value) {
          filters = [{ column: 'ClassJobCategoryTargetID', operator: '=', value: +this.job$.value + 1 }];
        } else {
          filters = [{ column: 'ClassJobCategoryTargetID', operator: '>=', value: 9 },
            { column: 'ClassJobCategoryTargetID', operator: '<=', value: 16 }];
        }

        filters.push({ column: 'ClassJobLevel', operator: '>=', value: this.levelMin$.value },
          { column: 'ClassJobLevel', operator: '<=', value: this.levelMax$.value });

        return this.xivapi.search({
          indexes: [SearchIndex.LEVE], string: query, filters: filters,
          columns: ['LevelLevemete.Map.ID', 'CraftLeve.Item0TargetID', 'CraftLeve.Item0.Icon',
            'CraftLeve.ItemCount0', 'CraftLeve.ItemCount1', 'CraftLeve.ItemCount2', 'CraftLeve.ItemCount3',
            'CraftLeve.Repeats', 'Name_*', 'GilReward', 'ExpReward', 'ClassJobCategoryTargetID', 'ClassJobLevel',
            'LevelLevemete.Map.PlaceNameTargetID', 'LevelLevemete.Y', 'PlaceNameStart.ID', 'ID'],
          // 105 is the amount of leves from 1 to 70 for a single job
          limit: 105
        });
      }),
      shareReplay(1)
    );

    this.results$ = combineLatest([this.globalExpChange$, res$]).pipe(
      map(([globalExp, list]) => {
        const results: Levequest[] = [];
        (<any>list).Results.forEach(leve => {
          results.push({
            id: leve.ID,
            level: leve.ClassJobLevel,
            jobId: leve.ClassJobCategoryTargetID - 1,
            itemId: leve.CraftLeve.Item0TargetID,
            itemIcon: leve.CraftLeve.Item0.Icon,
            exp: leve.ExpReward,
            gil: leve.GilReward,
            hq: this.settings.alwaysHQLeves,
            amount: globalExp ? 0 : 1,
            itemQuantity: leve.CraftLeve.ItemCount0
              + leve.CraftLeve.ItemCount1
              + leve.CraftLeve.ItemCount2
              + leve.CraftLeve.ItemCount3,
            name: {
              en: leve.Name_en,
              fr: leve.Name_fr,
              de: leve.Name_de,
              ja: leve.Name_ja,
              ko: this.lazyData.koLeves[leve.ID] ? this.lazyData.koLeves[leve.ID].ko : leve.Name_en
            },
            startPlaceId: leve.PlaceNameStart.ID,
            deliveryPlaceId: leve.LevelLevemete.Map.PlaceNameTargetID,
            repeats: leve.CraftLeve.Repeats
          });
        });

        return results.sort((a, b) => {
          if (a.jobId === b.jobId) {
            return a.level - b.level;
          } else {
            return a.jobId - b.jobId;
          }
        });
      }),
      tap(() => this.loading = false)
    );

    combineLatest([this.auth.gearSets$, this.job$]).pipe(
      distinctUntilChanged(([, a],[, b]) => a === b),
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
        this.job$.next(params.job ? +params.job : null);
        this.levelMin$.next(params.min || 1);
        this.levelMax$.next(params.max || 10);
      });
  }

  public getMaxExp(level: number): number {
    return this.gt.getMaxXp(level);
  }

  public getExp(leveExp: number, leves: Levequest[]): { level: number, exp: number, expPercent: number } {
    let exp: number;
    if (this.globalExp) {
      exp = this.startingExp + leves.reduce((total, leve) => this.getLeveExp(leve) + total, 0);
    } else {
      exp = this.startingExp + leveExp;
    }
    let level = this.startingLevel;
    while (exp - this.getMaxExp(level) >= 0 && level < 79) {
      exp -= this.getMaxExp(level);
      level++;
    }
    // Handle special case for lvl 80
    if (exp >= this.getMaxExp(level) && level >= 79) {
      level = 80;
      exp = 0;
    }
    return {
      level: level,
      expPercent: Math.min(100, Math.floor(100 * exp / this.getMaxExp(level))),
      exp: Math.min(exp, this.getMaxExp(level))
    };
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
                  return this.listManager.addToList(leve.itemId, list, craft.id,
                    leve.itemQuantity * this.craftAmount(leve));
                } else {
                  return this.listManager.addToList(leve.itemId, list, null,
                    leve.itemQuantity * this.craftAmount(leve));
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
          map(lists => lists.find(l => l.createdAt === list.createdAt && l.$key !== undefined)),
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
    const list = this.listsFacade.newEphemeralList(this.i18n.getName(this.l12n.getItem(leve.itemId)));

    const operation$ = this.dataService.getItem(leve.itemId).pipe(
      switchMap(itemData => {
        const craft = itemData.item.craft.find(c => c.job === leve.jobId);
        return this.listManager
          .addToList(leve.itemId, list, craft.id, leve.itemQuantity * this.craftAmount(leve))
          .pipe(
            tap(resultList => this.listsFacade.addList(resultList)),
            mergeMap(resultList => {
              return this.listsFacade.myLists$.pipe(
                map(lists => lists.find(l => l.createdAt === resultList.createdAt && l.$key !== undefined)),
                filter(l => l !== undefined),
                first()
              );
            })
          );
      })
    );

    this.progressService.showProgress(operation$, 1)
      .subscribe((newList) => {
        this.router.navigate(['list', newList.$key]);
      });
  }

  public getLeveExp(leve: Levequest): number {
    const res = leve.exp * this.craftAmount(leve);
    return leve.hq ? res * 2 : res;
  }

  public getLeveGil(leve: Levequest): number {
    const res = leve.gil * this.craftAmount(leve);
    return leve.hq ? res * 2 : res;
  }

  private craftAmount(leve: Levequest): number {
    return leve.amount * (leve.allDeliveries ? leve.repeats + 1 : 1);
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
}
