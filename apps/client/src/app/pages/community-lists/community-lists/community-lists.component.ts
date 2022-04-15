import { Component, OnDestroy } from '@angular/core';
import { ListsFacade } from '../../../modules/list/+state/lists.facade';
import { List } from '../../../modules/list/model/list';
import { ListTag } from '../../../modules/list/model/list-tag.enum';
import { BehaviorSubject, combineLatest, Observable, Subject } from 'rxjs';
import { debounceTime, first, map, switchMap, tap } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { FirestoreListStorage } from '../../../core/database/storage/list/firestore-list-storage';
import { TeamsFacade } from '../../../modules/teams/+state/teams.facade';
import { LayoutsFacade } from '../../../core/layout/+state/layouts.facade';
import * as semver from 'semver';

@Component({
  selector: 'app-community-lists',
  templateUrl: './community-lists.component.html',
  styleUrls: ['./community-lists.component.less']
})
export class CommunityListsComponent implements OnDestroy {

  public tags: any[];

  public tagsFilter$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);

  public excludeFilter$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);

  public nameFilter$: BehaviorSubject<string> = new BehaviorSubject<string>('');

  public page$: BehaviorSubject<number> = new BehaviorSubject<number>(1);

  private search$ = new Subject<void>();

  public pageSize = 20;

  public totalLength = 0;

  loading = false;

  filteredLists$: Observable<List[]>;

  private filters$: Observable<{ tags: string[], name: string, exclude: string[] }>;

  constructor(private listsFacade: ListsFacade, private listService: FirestoreListStorage,
              private teamsFacade: TeamsFacade, private layoutsFacade: LayoutsFacade,
              route: ActivatedRoute, router: Router) {
    this.teamsFacade.loadMyTeams();
    this.layoutsFacade.loadAll();
    this.tags = Object.keys(ListTag).map(key => {
      return {
        value: key,
        label: `LIST_TAGS.${key}`
      };
    });
    this.filters$ = this.search$.pipe(
      switchMap(() =>
        combineLatest([this.nameFilter$, this.tagsFilter$, this.excludeFilter$]).pipe(
          first()
        )
      ),
      tap(([name, tags, exclude]) => {
        this.page$.next(1);
        const queryParams = {};
        if (name !== '') {
          queryParams['name'] = name;
        }
        queryParams['tags'] = tags.join(',');
        queryParams['exclude'] = exclude.join(',');
        router.navigate([], {
          queryParamsHandling: 'merge',
          queryParams: queryParams,
          relativeTo: route
        });
      }),
      map(([name, tags, exclude]) => {
        return { name: name, tags: tags, exclude: exclude };
      })
    );
    route.queryParamMap
      .pipe(first())
      .subscribe((query) => {
        this.nameFilter$.next(query.get('name') || '');
        if (query.get('tags') !== null && query.get('tags').length > 0) {
          this.tagsFilter$.next(query.get('tags').split(',').filter(tag => tag !== ''));
        }
        if (query.get('exclude') !== null && query.get('exclude').length > 0) {
          this.excludeFilter$.next(query.get('exclude').split(',').filter(exclude => exclude !== ''));
        }
      });
    this.filteredLists$ = this.filters$.pipe(
      tap(() => this.loading = true),
      debounceTime(250),
      switchMap((filters) => {
        return this.listService.getCommunityLists(filters.tags, filters.name).pipe(
          map(lists => {
            return lists
              .filter(list => !list.tags.some(tags => filters.exclude.includes(tags)) && list.finalItems.length > 0)
              .sort((a, b) => {
                if (semver.gt(a.version, b.version)) {
                  return -1;
                } else if (semver.gt(b.version, a.version)) {
                  return 1;
                }
                return b.forks - a.forks;
              });
          }),
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

  search(): void {
    this.search$.next();
  }

  trackByList(index: number, list: List): string {
    return list.$key;
  }

  ngOnDestroy(): void {
    this.listService.stopListening('community');
  }

}
