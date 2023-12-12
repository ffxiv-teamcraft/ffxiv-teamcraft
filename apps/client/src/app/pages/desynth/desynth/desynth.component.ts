import { Component } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable, Subject } from 'rxjs';
import { debounce, filter, first, map, mergeMap, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { ListManagerService } from '../../../modules/list/list-manager.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { ListPickerService } from '../../../modules/list-picker/list-picker.service';
import { ListsFacade } from '../../../modules/list/+state/lists.facade';
import { ProgressPopupService } from '../../../modules/progress-popup/progress-popup.service';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { LazyJobAbbr } from '@ffxiv-teamcraft/data/model/lazy-job-abbr';
import { DataType, SearchResult, SearchType } from '@ffxiv-teamcraft/types';
import { DataService } from '../../../core/api/data.service';
import { I18nPipe } from '../../../core/i18n.pipe';
import { LazyRowPipe } from '../../../pipes/pipes/lazy-row.pipe';
import { JobUnicodePipe } from '../../../pipes/pipes/job-unicode.pipe';
import { XivapiIconPipe } from '../../../pipes/pipes/xivapi-icon.pipe';
import { ItemNamePipe } from '../../../pipes/pipes/item-name.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { PageLoaderComponent } from '../../../modules/page-loader/page-loader/page-loader.component';
import { FullpageMessageComponent } from '../../../modules/fullpage-message/fullpage-message/fullpage-message.component';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { DbButtonComponent } from '../../../core/db-button/db-button.component';
import { MarketboardIconComponent } from '../../../modules/marketboard/marketboard-icon/marketboard-icon.component';
import { ItemIconComponent } from '../../../modules/item-icon/item-icon/item-icon.component';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzWaveModule } from 'ng-zorro-antd/core/wave';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NgFor, NgIf, AsyncPipe } from '@angular/common';
import { TutorialStepDirective } from '../../../core/tutorial/tutorial-step.directive';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzFormModule } from 'ng-zorro-antd/form';
import { FormsModule } from '@angular/forms';
import { FlexModule } from '@angular/flex-layout/flex';

@Component({
    selector: 'app-desynth',
    templateUrl: './desynth.component.html',
    styleUrls: ['./desynth.component.less'],
    standalone: true,
    imports: [FlexModule, FormsModule, NzFormModule, NzGridModule, NzSelectModule, TutorialStepDirective, NgFor, NzInputModule, NzButtonModule, NzWaveModule, NzIconModule, NgIf, ItemIconComponent, MarketboardIconComponent, DbButtonComponent, NzTagModule, NzToolTipModule, NzPaginationModule, FullpageMessageComponent, PageLoaderComponent, AsyncPipe, TranslateModule, ItemNamePipe, XivapiIconPipe, JobUnicodePipe, LazyRowPipe, I18nPipe]
})
export class DesynthComponent {

  jobList$: Observable<[string, LazyJobAbbr][]> = this.lazyData.getEntry('jobAbbr').pipe(
    map(record => Object.entries(record).filter(([key]) => +key >= 8 && +key < 16))
  );

  job$: BehaviorSubject<number> = new BehaviorSubject<number>(null);

  level$: BehaviorSubject<number> = new BehaviorSubject<number>(null);

  search$: Subject<void> = new Subject<void>();

  loading = false;

  pristine = true;

  private searchResults$ = combineLatest([this.job$, this.level$, this.jobList$]).pipe(
    debounce(() => this.search$),
    filter(([job, level]) => job !== null && level !== null),
    tap(([job, level, jobList]) => {
      this.pristine = false;
      this.loading = true;
      this.router.navigate([], {
        queryParams: {
          job: jobList.find(([key]) => +key === +job)[1].en,
          level: level
        },
        relativeTo: this.route
      });
    }),
    switchMap(([job, level]) => {
      const dlvl = Math.round(level / 10) * 10;
      return this.dataService.search('', SearchType.ITEM, [
        {
          name: 'ilvl',
          minMax: true,
          value: {
            min: Math.max(dlvl - 10, 0),
            max: dlvl + 10
          }
        },
        {
          name: 'repair',
          value: +job
        },
        {
          name: 'desynth',
          minMax: true,
          value: {
            min: 0,
            max: 99999999
          }
        }
      ]);
    }),
    map((searchResult) => {
      return searchResult
        .map(item => {
          let score = 0;
          if (item.sources) {
            item.sources.forEach(source => {
              switch (source.type) {
                case DataType.TRADE_SOURCES:
                  score += 10;
                  break;
                case DataType.CRAFTED_BY:
                  score += 50;
                  break;
                case DataType.VENDORS:
                  score += 100;
                  break;
                case DataType.GATHERED_BY:
                  score += 100;
                  break;
                default:
                  break;
              }
            });
          }
          return {
            itemId: item.itemId,
            icon: item.icon,
            dlvl: item.ilvl,
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

  public page$: BehaviorSubject<number> = new BehaviorSubject<number>(1);

  results$ = combineLatest([this.searchResults$, this.page$])
    .pipe(
      map(([results, page]) => {
        const pageStart = Math.max(0, (page - 1) * this.pageSize);
        return results.slice(pageStart, pageStart + this.pageSize);
      })
    );

  public pageSize = 50;

  public totalLength = 0;

  constructor(private dataService: DataService, private lazyData: LazyDataFacade,
              private router: Router, private route: ActivatedRoute,
              private listManager: ListManagerService, private notificationService: NzNotificationService,
              private i18n: I18nToolsService, private listPicker: ListPickerService,
              private listsFacade: ListsFacade, private progressService: ProgressPopupService) {
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
