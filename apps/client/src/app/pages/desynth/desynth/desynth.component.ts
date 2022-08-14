import { Component } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable, Subject } from 'rxjs';
import { SearchIndex, XivapiService } from '@xivapi/angular-client';
import { debounce, filter, first, map, mergeMap, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { DesynthSearchResult } from '../desynth-search-result';
import { SearchResult } from '../../../model/search/search-result';
import { ListManagerService } from '../../../modules/list/list-manager.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { ListPickerService } from '../../../modules/list-picker/list-picker.service';
import { ListsFacade } from '../../../modules/list/+state/lists.facade';
import { ProgressPopupService } from '../../../modules/progress-popup/progress-popup.service';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { LazyJobAbbr } from '../../../lazy-data/model/lazy-job-abbr';

@Component({
  selector: 'app-desynth',
  templateUrl: './desynth.component.html',
  styleUrls: ['./desynth.component.less']
})
export class DesynthComponent {

  jobList$: Observable<[string, LazyJobAbbr][]>;

  job$: BehaviorSubject<number> = new BehaviorSubject<number>(null);

  level$: BehaviorSubject<number> = new BehaviorSubject<number>(null);

  search$: Subject<void> = new Subject<void>();

  loading = false;

  pristine = true;

  results$: Observable<DesynthSearchResult[]>;

  public page$: BehaviorSubject<number> = new BehaviorSubject<number>(1);

  public pageSize = 50;

  public totalLength = 0;

  constructor(private xivapi: XivapiService, private lazyData: LazyDataFacade,
              private router: Router, route: ActivatedRoute,
              private listManager: ListManagerService, private notificationService: NzNotificationService,
              private i18n: I18nToolsService, private listPicker: ListPickerService,
              private listsFacade: ListsFacade, private progressService: ProgressPopupService) {
    this.jobList$ = this.lazyData.getEntry('jobAbbr').pipe(
      map(record => Object.entries(record).filter(([key]) => +key >= 8 && +key < 16))
    );
    const searchResults$ = combineLatest([this.job$, this.level$, this.jobList$]).pipe(
      debounce(() => this.search$),
      filter(([job, level]) => job !== null && level !== null),
      tap(([job, level, jobList]) => {
        this.pristine = false;
        this.loading = true;
        router.navigate([], {
          queryParams: {
            job: jobList.find(([key]) => +key === +job)[1].en,
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
      .pipe(
        first(),
        withLatestFrom(this.jobList$)
      )
      .subscribe(([query, jobList]) => {
        if (query.get('level') !== null) {
          this.level$.next(+query.get('level'));
        }
        if (query.get('job') !== null) {
          const job = jobList.find(([, abbr]) => abbr.en === query.get('job'));
          this.job$.next(+job[0]);
        }
        setTimeout(() => {
          this.search$.next();
        }, 500);
      });
  }

  public createQuickList(item: SearchResult): void {
    this.i18n.getNameObservable('items', +item.itemId).pipe(
      first(),
      switchMap(itemName => {
        const list = this.listsFacade.newEphemeralList(itemName);
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
                map(lists => lists.find(l => l.createdAt.seconds === resultList.createdAt.seconds && l.$key !== undefined)),
                filter(l => l !== undefined),
                first()
              );
            })
          );
        return this.progressService.showProgress(operation$, 1);
      })
    )
      .subscribe((newList) => {
        this.router.navigate(['list', newList.$key]);
      });
  }

  public addItemsToList(items: SearchResult[]): void {
    this.listPicker.addToList(...items.map(item => {
      return {
        id: +item.itemId,
        recipeId: item.recipe ? item.recipe.recipeId : '',
        amount: item.amount,
        collectable: item.addCrafts
      };
    }));
  }

}
