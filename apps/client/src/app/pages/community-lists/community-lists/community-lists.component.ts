import { Component, OnDestroy } from '@angular/core';
import { ListsFacade } from '../../../modules/list/+state/lists.facade';
import { List } from '../../../modules/list/model/list';
import { ListTag } from '../../../modules/list/model/list-tag.enum';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { debounceTime, first, map, switchMap, tap } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { FirestoreListStorage } from '../../../core/database/storage/list/firestore-list-storage';

@Component({
  selector: 'app-community-lists',
  templateUrl: './community-lists.component.html',
  styleUrls: ['./community-lists.component.less']
})
export class CommunityListsComponent implements OnDestroy {

  public tags: any[];

  private filters$: Observable<{ tags: string[], name: string }>;

  public tagsFilter$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);

  public nameFilter$: BehaviorSubject<string> = new BehaviorSubject<string>('');

  public page$: BehaviorSubject<number> = new BehaviorSubject<number>(1);

  public pageSize = 20;

  public totalLength = 0;

  loading = true;

  filteredLists$: Observable<List[]>;

  constructor(private listsFacade: ListsFacade, private listService: FirestoreListStorage,
              route: ActivatedRoute, router: Router) {
    this.tags = Object.keys(ListTag).map(key => {
      return {
        value: key,
        label: `LIST_TAGS.${key}`
      };
    });
    this.filters$ = combineLatest([this.nameFilter$, this.tagsFilter$]).pipe(
      tap(([name, tags]) => {
        this.page$.next(1);
        const queryParams = {};
        if (name !== '') {
          queryParams['name'] = name;
        }
        queryParams['tags'] = tags.join(',');
        router.navigate([], {
          queryParamsHandling: 'merge',
          queryParams: queryParams,
          relativeTo: route
        });
      }),
      map(([name, tags]) => {
        return { name: name, tags: tags };
      })
    );
    route.queryParamMap
      .pipe(first())
      .subscribe((query) => {
        this.nameFilter$.next(query.get('name') || '');
        if (query.get('tags') !== null) {
          this.tagsFilter$.next(query.get('tags').split(',').filter(tag => tag !== ''));
        }
      });
    this.filteredLists$ = this.filters$.pipe(
      tap(() => this.loading = true),
      debounceTime(250),
      switchMap((filters) => {
        return this.listService.getCommunityLists(filters.tags, filters.name).pipe(
          tap(lists => {
            this.totalLength = lists.length;
          }),
          switchMap(lists => {
            return this.page$.pipe(map(page => {
              const pageStart = Math.max(0, (page - 1) * this.pageSize);
              return lists.slice(pageStart, pageStart + this.pageSize);
            }));
          })
        );
      }),
      tap(() => this.loading = false)
    );
  }

  trackByList(index: number, list: List): string {
    return list.$key;
  }

  ngOnDestroy(): void {
    this.listService.stopListening('community');
  }

}
