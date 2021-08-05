import { Component, TemplateRef, ViewChild } from '@angular/core';
import { BehaviorSubject, combineLatest, concat, Observable, of, Subject } from 'rxjs';
import { GarlandToolsService } from '../../../core/api/garland-tools.service';
import { SearchIndex, XivapiService } from '@xivapi/angular-client';
import { debounce, filter, first, map, mergeMap, switchMap, tap } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { DesynthSearchResult } from '../desynth-search-result';
import { SearchResult } from '../../../model/search/search-result';
import { ListManagerService } from '../../../modules/list/list-manager.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { LocalizedDataService } from '../../../core/data/localized-data.service';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { ListPickerService } from '../../../modules/list-picker/list-picker.service';
import { ListsFacade } from '../../../modules/list/+state/lists.facade';
import { ProgressPopupService } from '../../../modules/progress-popup/progress-popup.service';
import { List } from '../../../modules/list/model/list';

@Component({
  selector: 'app-desynth',
  templateUrl: './desynth.component.html',
  styleUrls: ['./desynth.component.less']
})
export class DesynthComponent {

  jobList: any[] = [];

  job$: BehaviorSubject<number> = new BehaviorSubject<number>(null);

  level$: BehaviorSubject<number> = new BehaviorSubject<number>(null);

  search$: Subject<void> = new Subject<void>();

  loading = false;

  pristine = true;

  results$: Observable<DesynthSearchResult[]>;

  public page$: BehaviorSubject<number> = new BehaviorSubject<number>(1);

  public pageSize = 50;

  public totalLength = 0;


  @ViewChild('notificationRef', { static: true })
  notification: TemplateRef<any>;

  // Notification data
  itemsAdded = 0;

  modifiedList: List;

  constructor(private gt: GarlandToolsService, private xivapi: XivapiService,
              private router: Router, route: ActivatedRoute,
              private listManager: ListManagerService, private notificationService: NzNotificationService,
              private l12n: LocalizedDataService, private i18n: I18nToolsService, private listPicker: ListPickerService,
              private listsFacade: ListsFacade, private progressService: ProgressPopupService) {
    this.jobList = this.gt.getJobs().slice(8, 16);
    const searchResults$ = combineLatest([this.job$, this.level$]).pipe(
      debounce(() => this.search$),
      filter(([job, level]) => job !== null && level !== null),
      tap(([job, level]) => {
        this.pristine = false;
        this.loading = true;
        router.navigate([], {
          queryParams: {
            job: this.jobList.find(j => j.id === +job).abbreviation,
            level: level
          },
          relativeTo: route
        });
      }),
      switchMap(([job, level]) => {
        const dlvl = Math.round(level / 10) * 10;
        return this.xivapi.search({
          indexes: [SearchIndex.ITEM],
          filters: [
            {
              column: 'LevelItem',
              operator: '>=',
              value: Math.max(dlvl - 10, 0)
            },
            {
              column: 'LevelItem',
              operator: '<=',
              value: dlvl + 10
            },
            {
              column: 'Desynth',
              operator: '>',
              value: 0
            },
            {
              column: 'ClassJobRepairTargetID',
              operator: '=',
              value: job
            }
          ],
          limit: 250,
          columns: [
            'Icon', 'LevelItem', 'ID', 'GameContentLinks'
          ]
        });
      }),
      map((searchResult) => {
        return searchResult.Results
          .map(item => {
            let score = 0;
            if (item.GameContentLinks) {
              if (item.GameContentLinks.SpecialShop !== undefined
                && Object.keys(item.GameContentLinks.SpecialShop).some(key => key.startsWith('ItemReceive'))) {
                score += 10;
              }
              if (item.GameContentLinks.Recipe !== undefined && item.GameContentLinks.Recipe.ItemResult !== undefined) {
                score += 50;
              }
              if (item.GameContentLinks.GilShopItem !== undefined) {
                score += 100;
              }
              if (item.GameContentLinks.FishParameter !== undefined) {
                score += 100;
              }
              if (item.GameContentLinks.SpearfishingItem !== undefined) {
                score += 100;
              }
            }
            return {
              itemId: item.ID,
              icon: item.Icon,
              dlvl: item.LevelItem,
              score: score,
              amount: 1
            };
          }).sort((a, b) => {
            return a.score === b.score ? a.itemId - b.itemId : b.score - a.score;
          });
      }),
      tap((res) => {
        this.totalLength = res.length;
        this.loading = false;
      })
    );

    this.results$ = combineLatest([searchResults$, this.page$])
      .pipe(
        map(([results, page]) => {
          const pageStart = Math.max(0, (page - 1) * this.pageSize);
          return results.slice(pageStart, pageStart + this.pageSize);
        })
      );

    route.queryParamMap
      .pipe(first())
      .subscribe((query) => {
        if (query.get('level') !== null) {
          this.level$.next(+query.get('level'));
        }
        if (query.get('job') !== null) {
          const job = this.jobList.find(j => j.abbreviation === query.get('job'));
          this.job$.next(job.id);
        }
        setTimeout(() => {
          this.search$.next();
        }, 500);
      });
  }

  public createQuickList(item: SearchResult): void {
    const list = this.listsFacade.newEphemeralList(this.i18n.getName(this.l12n.getItem(+item.itemId)));
    const operation$ = this.listManager.addToList({
      itemId: +item.itemId,
      list: list,
      recipeId: item.recipe ? item.recipe.recipeId : '',
      amount: item.amount,
      collectable: item.addCrafts
    })
      .pipe(
        tap(resultList => this.listsFacade.addList(resultList)),
        mergeMap(resultList => {
          return this.listsFacade.myLists$.pipe(
            map(lists => lists.find(l => l.createdAt.toMillis() === resultList.createdAt.toMillis() && l.$key !== undefined)),
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

  public addItemsToList(items: SearchResult[]): void {
    this.listPicker.pickList().pipe(
      mergeMap(list => {
        const operations = items.map(item => {
          return this.listManager.addToList({
            itemId: +item.itemId,
            list: list,
            recipeId: item.recipe ? item.recipe.recipeId : '',
            amount: item.amount,
            collectable: item.addCrafts
          });
        });
        let operation$: Observable<any>;
        if (operations.length > 0) {
          operation$ = concat(
            ...operations
          );
        } else {
          operation$ = of(list);
        }
        return this.progressService.showProgress(operation$,
          items.length,
          'Adding_recipes',
          { amount: items.length, listname: list.name });
      }),
      tap(list => list.$key ? this.listsFacade.updateList(list) : this.listsFacade.addList(list)),
      mergeMap(list => {
        // We want to get the list created before calling it a success, let's be pessimistic !
        return this.progressService.showProgress(
          combineLatest([this.listsFacade.myLists$, this.listsFacade.listsWithWriteAccess$]).pipe(
            map(([myLists, listsICanWrite]) => [...myLists, ...listsICanWrite]),
            map(lists => lists.find(l => l.createdAt.toMillis() === list.createdAt.toMillis() && l.$key !== undefined)),
            filter(l => l !== undefined),
            first()
          ), 1, 'Saving_in_database');
      })
    ).subscribe((list) => {
      this.itemsAdded = items.length;
      this.modifiedList = list;
      this.notificationService.template(this.notification);
    });
  }

}
