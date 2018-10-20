import { Injectable } from '@angular/core';

import { Store } from '@ngrx/store';

import { ListsState } from './lists.reducer';
import { listsQuery } from './lists.selectors';
import {
  CreateList,
  DeleteList,
  LoadListCompact,
  LoadListDetails,
  LoadListsWithWriteAccess,
  LoadMyLists,
  SelectList,
  SetItemDone,
  UpdateList,
  UpdateListIndex
} from './lists.actions';
import { List } from '../model/list';
import { NameQuestionPopupComponent } from '../../name-question-popup/name-question-popup/name-question-popup.component';
import { distinctUntilChanged, filter, first, map, shareReplay, switchMap, tap } from 'rxjs/operators';
import { NzModalService } from 'ng-zorro-antd';
import { TranslateService } from '@ngx-translate/core';
import { combineLatest, Observable, of } from 'rxjs';
import { AuthFacade } from '../../../+state/auth.facade';
import { PermissionLevel } from '../../../core/database/permissions/permission-level.enum';

declare const ga: Function;

@Injectable()
export class ListsFacade {
  loadingMyLists$ = this.store.select(listsQuery.getCompactsLoading);
  allListDetails$ = this.store.select(listsQuery.getAllListDetails);
  compacts$ = this.store.select(listsQuery.getCompacts);

  myLists$ = combineLatest(this.store.select(listsQuery.getCompacts), this.authFacade.userId$).pipe(
    map(([compacts, userId]) => {
      return compacts.filter(c => c.authorId === userId);
    }),
    map(lists => {
      return lists.sort((a, b) => {
        return a.index < b.index ? -1 : 1;
      });
    })
  );

  listsWithWriteAccess$ = combineLatest(this.store.select(listsQuery.getCompacts), this.authFacade.userId$, this.authFacade.fcId$).pipe(
    map(([compacts, userId, fcId]) => {
      return compacts.filter(c => {
        return Math.max(c.getPermissionLevel(userId), c.getPermissionLevel(fcId)) >= PermissionLevel.WRITE && c.authorId !== userId
      });
    }),
    shareReplay(1)
  );

  selectedList$ = this.store.select(listsQuery.getSelectedList);

  selectedListPermissionLevel$ = this.authFacade.loggedIn$.pipe(
    switchMap(loggedIn => {
      return combineLatest(
        this.selectedList$,
        this.authFacade.userId$,
        loggedIn ? this.authFacade.mainCharacter$.pipe(map(c => c.FreeCompanyId)) : of(null)
      );
    }),
    map(([list, userId, fcId]) => {
      return Math.max(list.getPermissionLevel(userId), list.getPermissionLevel(fcId));
    }),
    distinctUntilChanged(),
    shareReplay(1)
  );

  constructor(private store: Store<{ lists: ListsState }>, private dialog: NzModalService, private translate: TranslateService, private authFacade: AuthFacade) {
  }

  getWorkshopCompacts(keys: string[]): Observable<List[]> {
    return this.compacts$.pipe(
      map(compacts => keys.map(key => compacts.find(compact => compact.$key === key)))
    );
  }

  createEmptyList(): void {
    this.newList().subscribe(list => {
      this.addList(list);
    });
  }

  newList(): Observable<List> {
    return this.dialog.create({
      nzContent: NameQuestionPopupComponent,
      nzFooter: null,
      nzTitle: this.translate.instant('New_List')
    }).afterClose.pipe(
      filter(name => name !== undefined),
      map(name => {
        const list = new List();
        list.name = name;
        return list;
      })
    );
  }

  newEphemeralList(itemName: string): List {
    const list = new List();
    list.ephemeral = true;
    list.name = itemName;
    return list;
  }

  setItemDone(itemId: number, itemIcon: number, finalItem: boolean, delta: number): void {
    this.store.dispatch(new SetItemDone(itemId, itemIcon, finalItem, delta));
  }

  addList(list: List): void {
    this.store.dispatch(new CreateList(list));
    ga('send', 'event', 'List', 'creation');
  }

  deleteList(key: string): void {
    this.store.dispatch(new DeleteList(key));
    ga('send', 'event', 'List', 'deletion');
  }

  updateList(list: List, updateCompact = false): void {
    this.store.dispatch(new UpdateList(list, updateCompact));
  }

  updateListUsingCompact(compact: List): void {
    this.allListDetails$.pipe(
      map(lists => lists.find(l => l.$key === compact.$key)),
      tap(l => l === undefined ? this.load(compact.$key) : null),
      switchMap(details => {
        if (details === undefined) {
          return this.allListDetails$.pipe(
            map(lists => lists.find(l => l.$key === compact.$key)),
            filter(l => l !== undefined),
            first()
          );
        } else {
          return of(details);
        }
      }),
      map(details => {
        Object.keys(compact).forEach(compactProperty => {
          if (JSON.stringify(details[compactProperty]) !== JSON.stringify(compact[compactProperty])) {
            details[compactProperty] = compact[compactProperty];
          }
        });
        return details;
      }),
      first()
    ).subscribe((details) => {
      this.updateList(details, true);
    });
  }

  updateListIndex(list: List): void {
    this.store.dispatch(new UpdateListIndex(list));
  }

  loadMyLists(): void {
    this.store.dispatch(new LoadMyLists());
  }

  loadListsWithWriteAccess(): void {
    this.store.dispatch(new LoadListsWithWriteAccess());
  }

  loadCompact(key: string): void {
    this.store.dispatch(new LoadListCompact(key));
  }

  load(key: string): void {
    this.store.dispatch(new LoadListDetails(key));
  }

  select(key: string): void {
    this.store.dispatch(new SelectList(key));
  }
}
