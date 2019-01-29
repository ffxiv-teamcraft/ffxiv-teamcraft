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
  LoadMyLists, LoadTeamLists,
  NeedsVerification,
  SelectList,
  SetItemDone, UnloadListDetails,
  UpdateItem,
  UpdateList,
  UpdateListIndex
} from './lists.actions';
import { List } from '../model/list';
import { NameQuestionPopupComponent } from '../../name-question-popup/name-question-popup/name-question-popup.component';
import { delay, distinctUntilChanged, filter, first, map, shareReplay, switchMap, tap } from 'rxjs/operators';
import { NzModalService } from 'ng-zorro-antd';
import { TranslateService } from '@ngx-translate/core';
import { combineLatest, Observable, of } from 'rxjs';
import { AuthFacade } from '../../../+state/auth.facade';
import { PermissionLevel } from '../../../core/database/permissions/permission-level.enum';
import { ListRow } from '../model/list-row';
import { TeamsFacade } from '../../teams/+state/teams.facade';
import { Team } from '../../../model/team/team';
import { SettingsService } from '../../settings/settings.service';

declare const gtag: Function;

@Injectable({
  providedIn: 'root'
})
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
        return a.index - b.index;
      });
    }),
    shareReplay(1)
  );

  listsWithWriteAccess$ = this.authFacade.loggedIn$.pipe(
    switchMap(loggedIn => {
      if (!loggedIn) {
        return combineLatest(this.store.select(listsQuery.getCompacts), this.authFacade.userId$).pipe(
          map(([compacts, userId]) => {
            return compacts.filter(c => {
              return c.getPermissionLevel(userId) >= PermissionLevel.WRITE && c.authorId !== userId;
            });
          })
        );
      }
      return combineLatest(this.store.select(listsQuery.getCompacts), this.authFacade.user$, this.authFacade.userId$, this.authFacade.fcId$).pipe(
        map(([compacts, user, userId, fcId]) => {
          if (user !== null) {
            const idEntry = user.lodestoneIds.find(l => l.id === user.defaultLodestoneId);
            const verified = idEntry && idEntry.verified;
            if (!verified) {
              fcId = null;
            }
          }
          return compacts.filter(c => {
            return !c.notFound && Math.max(c.getPermissionLevel(userId), c.getPermissionLevel(fcId)) >= PermissionLevel.WRITE && c.authorId !== userId;
          }).sort((a, b) => a.$key > b.$key ? -1 : 1);
        })
      );
    }),
    shareReplay(1)
  );

  communityLists$ = this.store.select(listsQuery.getCompacts).pipe(
    map((compacts) => {
      return compacts
        .filter(c => {
          return c.public;
        })
        .sort((a, b) => a.$key > b.$key ? -1 : 1);
    }),
    shareReplay(1)
  );

  selectedList$ = this.store.select(listsQuery.getSelectedList).pipe(filter(list => list !== undefined));

  selectedListPermissionLevel$ = this.authFacade.loggedIn$.pipe(
    switchMap(loggedIn => {
      return combineLatest(
        this.selectedList$,
        loggedIn ? this.authFacade.user$ : of(null),
        this.authFacade.userId$,
        this.teamsFacade.selectedTeam$,
        loggedIn ? this.authFacade.mainCharacter$.pipe(map(c => c.FreeCompanyId)) : of(null)
      );
    }),
    filter(([list]) => list !== undefined),
    map(([list, user, userId, team, fcId]) => {
      if (user !== null) {
        const idEntry = user.lodestoneIds.find(l => l.id === user.defaultLodestoneId);
        const verified = idEntry && idEntry.verified;
        if (!verified) {
          fcId = null;
        }
      }
      if (list.notFound) {
        return 20;
      }
      return Math.max(list.getPermissionLevel(userId), list.getPermissionLevel(fcId), (team !== undefined && list.teamId === team.$key) ? 20 : 0);
    }),
    distinctUntilChanged(),
    shareReplay(1)
  );

  needsVerification$ = this.store.select(listsQuery.getNeedsVerification);

  constructor(private store: Store<{ lists: ListsState }>, private dialog: NzModalService, private translate: TranslateService, private authFacade: AuthFacade,
              private teamsFacade: TeamsFacade, private settings: SettingsService) {
  }

  getTeamLists(team: Team): Observable<List[]> {
    return this.compacts$.pipe(
      map(compacts => compacts.filter(compact => compact.teamId === team.$key))
    );
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
        list.everyone = this.settings.defaultPermissionLevel;
        list.name = name;
        return list;
      })
    );
  }

  newEphemeralList(itemName: string): List {
    const list = new List();
    list.everyone = this.settings.defaultPermissionLevel;
    list.ephemeral = true;
    list.name = itemName;
    return list;
  }

  setItemDone(itemId: number, itemIcon: number, finalItem: boolean, delta: number, recipeId: string): void {
    this.store.dispatch(new SetItemDone(itemId, itemIcon, finalItem, delta, recipeId));
  }

  updateItem(item: ListRow, finalItem: boolean): void {
    this.store.dispatch(new UpdateItem(item, finalItem));
  }

  addList(list: List): void {
    this.store.dispatch(new CreateList(list));
    gtag('send', 'event', 'List', 'creation');
  }

  deleteList(key: string): void {
    this.store.dispatch(new DeleteList(key));
    gtag('send', 'event', 'List', 'deletion');
  }

  updateList(list: List, updateCompact = false): void {
    this.store.dispatch(new UpdateList(list, updateCompact));
  }

  loadTeamLists(teamId: string): void {
    this.store.dispatch(new LoadTeamLists(teamId));
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

  unload(key: string): void {
    this.store.dispatch(new UnloadListDetails(key));
  }

  setNeedsverification(needed: boolean): void {
    this.store.dispatch(new NeedsVerification(needed));
  }

  loadAndWait(key: string): Observable<List> {
    this.load(key);
    return this.allListDetails$.pipe(
      delay(500),
      map(details => details.find(l => l.$key === key)),
      filter(list => list !== undefined),
      first()
    );
  }

  select(key: string): void {
    this.store.dispatch(new SelectList(key));
  }
}
