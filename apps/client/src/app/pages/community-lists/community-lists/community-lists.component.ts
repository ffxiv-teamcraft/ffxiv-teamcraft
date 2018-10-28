import { Component } from '@angular/core';
import { ListsFacade } from '../../../modules/list/+state/lists.facade';
import { List } from '../../../modules/list/model/list';
import { ListTag } from '../../../modules/list/model/list-tag.enum';
import { BehaviorSubject, combineLatest, Observable, Subject } from 'rxjs';
import { first, map, tap } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-community-lists',
  templateUrl: './community-lists.component.html',
  styleUrls: ['./community-lists.component.less']
})
export class CommunityListsComponent {

  public tags: any[];

  private filters$: Observable<{ tags: string[], name: string }>;

  public tagsFilter$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);

  public nameFilter$: BehaviorSubject<string> = new BehaviorSubject<string>('');

  loading$ = this.listsFacade.communityListsLoading$;

  filteredLists$: Observable<List[]>;

  constructor(private listsFacade: ListsFacade, route: ActivatedRoute, router: Router) {
    this.listsFacade.loadCommunityLists();
    this.tags = Object.keys(ListTag).map(key => {
      return {
        value: key,
        label: `LIST_TAGS.${key}`
      };
    });
    this.filters$ = combineLatest(this.nameFilter$, this.tagsFilter$).pipe(
      tap(([name, tags]) => {
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
    this.filteredLists$ = combineLatest(this.listsFacade.communityLists$, this.filters$).pipe(
      map(([lists, filters]) => {
        return lists.filter(list => {
          return list.name.indexOf(filters.name) > -1 && filters.tags.reduce((matches, tag) => matches && list.tags.indexOf(<ListTag>tag) > -1, true);
        });
      })
    );
  }

  trackByList(index: number, list: List): string {
    return list.$key;
  }

}
