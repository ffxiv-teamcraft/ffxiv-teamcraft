import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SearchIndex, XivapiService } from '@xivapi/angular-client';
import { NzNotificationService } from 'ng-zorro-antd';
import { BehaviorSubject, concat, Observable } from 'rxjs';
import { debounceTime, filter, first, map, mergeMap, switchMap, tap } from 'rxjs/operators';
import { GarlandToolsService } from '../../../core/api/garland-tools.service';
import { LocalizedDataService } from '../../../core/data/localized-data.service';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { ListPickerService } from '../../../modules/list-picker/list-picker.service';
import { ListsFacade } from '../../../modules/list/+state/lists.facade';
import { ListManagerService } from '../../../modules/list/list-manager.service';
import { List } from '../../../modules/list/model/list';
import { ProgressPopupService } from '../../../modules/progress-popup/progress-popup.service';
import { Levequest } from '../../../model/search/levequest';

@Component({
  selector: 'app-levequests',
  templateUrl: './levequests.component.html',
  styleUrls: ['./levequests.component.less']
})
export class LevequestsComponent implements OnInit {

  jobList: any[] = [];

  job$: BehaviorSubject<number> = new BehaviorSubject<number>(null);

  query$: BehaviorSubject<string> = new BehaviorSubject<string>('');

  levelMin$: BehaviorSubject<number> = new BehaviorSubject<number>(60);

  levelMax$: BehaviorSubject<number> = new BehaviorSubject<number>(70);

  results$: Observable<Levequest[]>;

  showIntro = true;

  loading = false;

  // Notification data
  itemsAdded = 0;

  modifiedList: List;

  allSelected = false;

  @ViewChild('notificationRef')
  notification: TemplateRef<any>;

  constructor(private xivapi: XivapiService, private listsFacade: ListsFacade,
              private router: Router, private route: ActivatedRoute, private listManager: ListManagerService,
              private notificationService: NzNotificationService, private gt: GarlandToolsService,
              private l12n: LocalizedDataService, private i18n: I18nToolsService,
              private listPicker: ListPickerService, private progressService: ProgressPopupService) {
    this.jobList = this.gt.getJobs().slice(8, 16);
  }

  ngOnInit(): void {
    this.results$ = this.query$.pipe(
      tap(query => {
        this.router.navigate([], {
          queryParamsHandling: 'merge',
          queryParams: { query: query.length > 0 ? query : null },
          relativeTo: this.route
        });
      }),
      debounceTime(500),
      filter((query) => query.length > 3 || this.job$.value !== null),
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
          columns: ['LevelLevemete.Map.ID', 'CraftLeve.Item0TargetID', 'CraftLeve.Item0.Icon', 'CraftLeve.ItemCount0',
            'CraftLeve.Item0Recipes.*2.ID', 'CraftLeve.Item0Recipes.*2.ClassJob', 'CraftLeve.Repeats',
            'Name', 'GilReward', 'ExpReward', 'ClassJobCategoryTargetID', 'ClassJobLevel',
            'LevelLevemete.X', 'LevelLevemete.Y', 'PlaceNameStart.ID'],
          // 105 is the amount of leves from 1 to 70 for a single job
          limit: 105
        });
      }),
      map(list => {
        const results: Levequest[] = [];
        (<any>list).Results.forEach(leve => {
          results.push({
            level: leve.ClassJobLevel,
            jobId: leve.ClassJobCategoryTargetID - 1,
            itemId: leve.CraftLeve.Item0TargetID,
            itemIcon: leve.CraftLeve.Item0.Icon,
            recipes: leve.CraftLeve.Item0Recipes.filter(recipe => recipe.ID !== null)
              .map(recipe => ({ recipeId: recipe.ID, jobId: recipe.ClassJob })),
            exp: leve.ExpReward,
            gil: leve.GilReward,
            amount: 1,
            itemQuantity: leve.CraftLeve.ItemCount0,
            name: leve.Name,
            startCoordinates: { x: leve.LevelLevemete.X, y: leve.LevelLevemete.Y },
            startMapId: leve.LevelLevemete.Map.ID,
            startPlaceId: leve.PlaceNameStart.ID,
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

    this.route.queryParams
      .subscribe(params => {
        this.query$.next(params.query || '');
        this.job$.next(params.job ? +params.job : null);
        this.levelMin$.next(params.min || 60);
        this.levelMax$.next(params.max || 70);
      });
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
            const recipe = leve.recipes.find(r => r.jobId === leve.jobId);
            return this.listManager.addToList(leve.itemId, list, recipe.recipeId,
              this.craftAmount(leve));
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
    const recipe = leve.recipes[0];
    const operation$ = this.listManager
      .addToList(leve.itemId, list, recipe.recipeId, this.craftAmount(leve))
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

    this.progressService.showProgress(operation$, 1)
      .subscribe((newList) => {
        this.router.navigate(['list', newList.$key]);
      });
  }

  private craftAmount(leve: Levequest): number {
    return leve.amount * leve.itemQuantity * (leve.allDeliveries ? leve.repeats + 1 : 1);
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
