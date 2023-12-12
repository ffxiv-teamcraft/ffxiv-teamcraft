import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { BehaviorSubject, combineLatest, concat, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, first, map, mergeMap, shareReplay, switchMap, takeUntil, tap } from 'rxjs/operators';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { ListPickerService } from '../../../modules/list-picker/list-picker.service';
import { ListsFacade } from '../../../modules/list/+state/lists.facade';
import { ListManagerService } from '../../../modules/list/list-manager.service';
import { List } from '../../../modules/list/model/list';
import { ProgressPopupService } from '../../../modules/progress-popup/progress-popup.service';
import { I18nName, Levequest } from '@ffxiv-teamcraft/types';
import { AuthFacade } from '../../../+state/auth.facade';
import { TeamcraftComponent } from '../../../core/component/teamcraft-component';
import { SettingsService } from '../../../modules/settings/settings.service';
import { PlatformService } from '../../../core/tools/platform.service';
import { IpcService } from '../../../core/electron/ipc.service';
import { EnvironmentService } from '../../../core/environment.service';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { LazyData } from '@ffxiv-teamcraft/data/model/lazy-data';
import { JobUnicodePipe } from '../../../pipes/pipes/job-unicode.pipe';
import { I18nRowPipe } from '../../../core/i18n/i18n-row.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { I18nPipe } from '../../../core/i18n.pipe';
import { FullpageMessageComponent } from '../../../modules/fullpage-message/fullpage-message/fullpage-message.component';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { DbButtonComponent } from '../../../core/db-button/db-button.component';
import { I18nNameComponent } from '../../../core/i18n/i18n-name/i18n-name.component';
import { ItemIconComponent } from '../../../modules/item-icon/item-icon/item-icon.component';
import { PageLoaderComponent } from '../../../modules/page-loader/page-loader/page-loader.component';
import { NzWaveModule } from 'ng-zorro-antd/core/wave';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NgFor, NgIf, AsyncPipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { FlexModule } from '@angular/flex-layout/flex';

interface ExpObj {
  exp: number,
  level: number,
  totalExp: number
}

@Component({
    selector: 'app-levequests',
    templateUrl: './levequests.component.html',
    styleUrls: ['./levequests.component.less'],
    standalone: true,
    imports: [FlexModule, NzGridModule, NzSelectModule, FormsModule, NgFor, NgIf, NzButtonModule, NzInputModule, NzIconModule, NzToolTipModule, NzInputNumberModule, NzSwitchModule, NzCheckboxModule, NzWaveModule, PageLoaderComponent, ItemIconComponent, I18nNameComponent, DbButtonComponent, NzProgressModule, FullpageMessageComponent, RouterLink, AsyncPipe, DecimalPipe, I18nPipe, TranslateModule, I18nRowPipe, JobUnicodePipe]
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

  paramGrow: LazyData['paramGrow'] = {};

  levesIndex$ = this.lazyData.getEntry('leves').pipe(
    map(leves => Object.entries(leves).map(([k, v]) => ({ id: +k, ...v }))),
    shareReplay({ refCount: true, bufferSize: 1 })
  );

  constructor(private listsFacade: ListsFacade,
              private router: Router, private route: ActivatedRoute,
              private listManager: ListManagerService, private notificationService: NzNotificationService,
              private i18n: I18nToolsService, private lazyData: LazyDataFacade,
              private listPicker: ListPickerService, private progressService: ProgressPopupService,
              private auth: AuthFacade,
              private settings: SettingsService, private platformService: PlatformService, private ipc: IpcService,
              private environment: EnvironmentService) {
    super();
    this.lazyData.getEntry('paramGrow').pipe(
      first()
    ).subscribe(paramGrow => {
      this.paramGrow = paramGrow;
    });
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
        return this.levesIndex$.pipe(
          map(leves => {
            return leves.filter(leve => {
              let matches = !query || this.i18n.getName(leve).includes(query);

              if (job) {
                matches = matches && leve.job.id === +job + 1;
              } else {
                matches = matches && leve.job.id >= 9 && leve.job.id <= 16;
              }

              matches = matches && leve.lvl >= levelMin && leve.lvl <= levelMax;

              return matches;
            });
          })
        );
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    );

    this.results$ = combineLatest([this.globalExpChange$, res$, this.hideLargeChange$, this.roadToBuffChange$]).pipe(
      map(([globalExp, leves, hideLarge, roadToBuff]) => {
        this.settings.hideLargeLeves = hideLarge;
        const results: Levequest[] = [];
        leves.forEach(leve => {
          results.push({
            id: leve.id,
            level: leve.lvl,
            jobId: leve.job.id - 1,
            itemId: leve.items[0].itemId,
            exp: leve.expReward * (roadToBuff ? 2 : 1),
            gil: leve.gilReward * (roadToBuff ? 2 : 1),
            hq: this.settings.alwaysHQLeves && leve.job.id - 1 !== 18,
            allDeliveries: this.settings.alwaysAllDeliveries,
            amount: globalExp ? 0 : 1,
            itemQuantity: leve.items.reduce((acc, item) => acc + item.amount, 0),
            startPlaceId: leve.startPlaceId,
            deliveryPlaceId: leve.deliveryPlaceId,
            repeats: leve.repeats,
            allowanceCost: leve.cost
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
    return this.paramGrow[level]?.ExpToNext || 1;
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
            return this.lazyData.getRow('recipesPerItem', leve.itemId, []).pipe(
              switchMap(recipes => {
                if (recipes.length > 0) {
                  const craft = recipes.find(c => c.job === leve.jobId);
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

        const operation$ = this.lazyData.getRow('recipesPerItem', leve.itemId, []).pipe(
          switchMap(recipes => {
            const craft = recipes.find(c => c.job === leve.jobId);
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
