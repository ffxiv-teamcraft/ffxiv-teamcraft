import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { BehaviorSubject, combineLatest, concat, Observable, Subject } from 'rxjs';
import { GarlandToolsService } from '../../../core/api/garland-tools.service';
import { DataService } from '../../../core/api/data.service';
import { debounceTime, filter, first, map, mergeMap, skip, takeUntil, tap } from 'rxjs/operators';
import { SearchResult } from '../../../model/search/search-result';
import { SettingsService } from '../../settings/settings.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ListsFacade } from '../../../modules/list/+state/lists.facade';
import { List } from '../../../modules/list/model/list';
import { ListManagerService } from '../../../modules/list/list-manager.service';
import { NzNotificationService } from 'ng-zorro-antd';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.less']
})
export class SearchComponent implements OnInit {

  query$: BehaviorSubject<string> = new BehaviorSubject<string>('');

  onlyRecipes$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(this.settings.recipesOnlySearch);

  results$: Observable<SearchResult[]>;

  yourLists$: Observable<List[]>;

  showIntro = true;

  loading = false;

  listPickerVisible$: Subject<boolean> = new Subject<boolean>();

  pickedList$: Subject<List> = new Subject<List>();

  @ViewChild('notificationRef')
  notification: TemplateRef<any>;

  // Notification data
  itemsAdded = 0;

  modifiedList: List;

  constructor(private gt: GarlandToolsService, private data: DataService, public settings: SettingsService,
              private router: Router, private route: ActivatedRoute, private listsFacade: ListsFacade,
              private listManager: ListManagerService, private notificationService: NzNotificationService) {
  }

  ngOnInit(): void {
    this.yourLists$ = this.listsFacade.allLists$;

    this.listsFacade.loadAll();

    this.results$ = combineLatest(this.query$, this.onlyRecipes$).pipe(
      filter(([query]) => query.length > 3),
      debounceTime(500),
      tap(([query, onlyRecipes]) => {
        this.showIntro = false;
        this.loading = true;
        const queryParams = {
          query: query,
          onlyRecipes: onlyRecipes
        };
        this.router.navigate([], {
          queryParamsHandling: 'merge',
          queryParams: queryParams,
          relativeTo: this.route
        });
      }),
      mergeMap(([query, onlyRecipes]) => this.data.searchItem(query, [], onlyRecipes)),
      tap(() => {
        this.loading = false;
      })
    );

    this.route.queryParams.pipe(
      filter(params => {
        return params.query !== undefined && params.onlyRecipes !== undefined;
      })
    ).subscribe(params => {
      this.onlyRecipes$.next(params.onlyRecipes);
      this.query$.next(params.query);
    });
  }

  public addItemsToList(items: SearchResult[]): void {
    this.listPickerVisible$.next(true);
    this.pickedList$.pipe(
      takeUntil(this.listPickerVisible$),
      mergeMap(list => {
        return concat(
          ...items.map(item => {
            return this.listManager.addToList(item.itemId, list,
              item.recipe ? item.recipe.recipeId : '', item.amount, item.addCrafts);
          })
        ).pipe(
          skip(items.length - 1)
        );
      }),
      tap(list => list.$key ? this.listsFacade.updateList(list) : this.listsFacade.addList(list)),
      mergeMap(list => {
        // We want to get the list created before calling it a success, let's be pessimistic !
        return this.listsFacade.allLists$.pipe(
          map(lists => lists.find(l => l.createdAt === list.createdAt)),
          filter(l => l !== undefined),
          first()
        )
      })
    ).subscribe((list) => {
      this.itemsAdded = items.length;
      this.modifiedList = list;
      this.notificationService.template(this.notification);
    });
  }

  public pickList(list: List): void {
    this.pickedList$.next(list);
    this.listPickerVisible$.next(false);
  }

  public pickNewList(): void {
    this.listsFacade.newList().subscribe(list => {
      this.pickedList$.next(list);
      this.listPickerVisible$.next(false);
    });
  }
}
