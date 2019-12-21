import { Injectable } from '@angular/core';

import { Store } from '@ngrx/store';

import { ListsState } from './lists.reducer';
import { listsQuery } from './lists.selectors';
import {
  CreateList,
  DeleteList,
  LoadListDetails,
  LoadMyLists,
  LoadSharedLists,
  LoadTeamLists,
  NeedsVerification,
  OfflineListsLoaded,
  PinList,
  SelectList,
  SetItemDone,
  ToggleAutocompletion,
  ToggleCompletionNotification,
  UnPinList,
  UpdateItem,
  UpdateList,
  UpdateListIndex
} from './lists.actions';
import { List } from '../model/list';
import { NameQuestionPopupComponent } from '../../name-question-popup/name-question-popup/name-question-popup.component';
import { distinctUntilChanged, filter, first, map, shareReplay, switchMap, throttleTime } from 'rxjs/operators';
import { NzModalService } from 'ng-zorro-antd';
import { TranslateService } from '@ngx-translate/core';
import { combineLatest, Observable, of } from 'rxjs';
import { AuthFacade } from '../../../+state/auth.facade';
import { PermissionLevel } from '../../../core/database/permissions/permission-level.enum';
import { ListRow } from '../model/list-row';
import { TeamsFacade } from '../../teams/+state/teams.facade';
import { Team } from '../../../model/team/team';
import { SettingsService } from '../../settings/settings.service';
import { environment } from '../../../../environments/environment';
import { InventoryFacade } from '../../inventory/+state/inventory.facade';

declare const gtag: Function;

@Injectable({
  providedIn: 'root'
})
export class ListsFacade {
  loadingMyLists$ = this.store.select(listsQuery.getListsLoading);
  allListDetails$ = this.store.select(listsQuery.getAllListDetails)
    .pipe(
      map(lists => {
        return lists.filter(list => {
          return list.finalItems !== undefined
            && list.items !== undefined
            && list.isOutDated
            && typeof list.isOutDated === 'function';
        });
      })
    );

  myLists$ = combineLatest([this.store.select(listsQuery.getAllListDetails), this.authFacade.userId$]).pipe(
    map(([compacts, userId]) => {
      return compacts.filter(c => c.authorId === userId);
    }),
    map(lists => {
      return this.sortLists(lists);
    }),
    shareReplay(1)
  );

  sharedLists$ = this.authFacade.loggedIn$.pipe(
    switchMap(loggedIn => {
      if (!loggedIn) {
        return combineLatest([this.store.select(listsQuery.getAllListDetails), this.authFacade.userId$]).pipe(
          map(([compacts, userId]) => {
            return compacts.filter(c => {
              return !c.notFound
                && c.getPermissionLevel(userId) >= PermissionLevel.PARTICIPATE
                && c.hasExplicitPermissions(userId)
                && c.authorId !== userId;
            });
          })
        );
      }
      return combineLatest([this.store.select(listsQuery.getAllListDetails), this.authFacade.user$, this.authFacade.userId$, this.authFacade.fcId$]).pipe(
        map(([compacts, user, userId, fcId]) => {
          if (user !== null) {
            const idEntry = user.lodestoneIds.find(l => l.id === user.defaultLodestoneId);
            const verified = idEntry && idEntry.verified;
            if (!verified) {
              fcId = null;
            }
          }
          return this.sortLists(
            compacts.filter(c => {
              return !c.notFound
                && Math.max(c.getPermissionLevel(userId), c.getPermissionLevel(fcId)) >= PermissionLevel.PARTICIPATE
                && (c.hasExplicitPermissions(userId) || c.hasExplicitPermissions(fcId))
                && c.authorId !== userId;
            })
          );
        })
      );
    }),
    shareReplay(1)
  );

  public listsWithWriteAccess$ = combineLatest([this.sharedLists$, this.authFacade.user$, this.authFacade.userId$, this.authFacade.fcId$]).pipe(
    map(([compacts, user, userId, fcId]) => {
      if (user !== null) {
        const idEntry = user.lodestoneIds.find(l => l.id === user.defaultLodestoneId);
        const verified = idEntry && idEntry.verified;
        if (!verified) {
          fcId = null;
        }
      }
      return this.sortLists(
        compacts.filter(c => {
          return !c.notFound
            && Math.max(c.getPermissionLevel(userId), c.getPermissionLevel(fcId)) >= PermissionLevel.WRITE
            && c.authorId !== userId;
        })
      );
    })
  );

  selectedList$ = this.store.select(listsQuery.getSelectedList()).pipe(
    filter(list => list !== undefined),
    throttleTime<List>(1000),
    shareReplay(1)
  );

  selectedListPermissionLevel$ = this.authFacade.loggedIn$.pipe(
    switchMap(loggedIn => {
      return combineLatest([
        this.selectedList$,
        loggedIn ? this.authFacade.user$ : of(null),
        this.authFacade.userId$,
        this.teamsFacade.selectedTeam$,
        loggedIn ? this.authFacade.mainCharacter$.pipe(map(c => c.FreeCompanyId)) : of(null)
      ]);
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

  autocompleteEnabled$ = this.store.select(listsQuery.getAutocompleteEnabled);

  pinnedList$ = this.store.select(listsQuery.getPinnedListKey());

  completionNotificationEnabled$ = this.store.select(listsQuery.getCompletionNotificationEnabled);

  constructor(private store: Store<{ lists: ListsState }>, private dialog: NzModalService, private translate: TranslateService, private authFacade: AuthFacade,
              private teamsFacade: TeamsFacade, private settings: SettingsService, private userInventoryService: InventoryFacade) {
  }

  getTeamLists(team: Team): Observable<List[]> {
    return this.allListDetails$.pipe(
      map(compacts => compacts.filter(compact => compact.teamId === team.$key))
    );
  }

  getWorkshopCompacts(keys: string[]): Observable<List[]> {
    return this.allListDetails$.pipe(
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
      nzTitle: this.translate.instant('New_List'),
      nzComponentParams: {
        showEphemeralCheckbox: true,
        showOfflineCheckbox: true
      }
    }).afterClose.pipe(
      filter(res => res && res.name !== undefined),
      map(res => {
        const list = new List();
        list.everyone = this.settings.defaultPermissionLevel;
        list.name = res.name;
        list.ephemeral = res.ephemeral;
        list.offline = res.offline;
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

  setItemDone(itemId: number, itemIcon: number, finalItem: boolean, delta: number, recipeId: string, totalNeeded: number, external = false, fromPacket = false, hq = false): void {
    this.store.dispatch(new SetItemDone(itemId, itemIcon, finalItem, delta, recipeId, totalNeeded, external, fromPacket, hq));
  }

  updateItem(item: ListRow, finalItem: boolean): void {
    this.store.dispatch(new UpdateItem(item, finalItem));
  }

  addList(list: List): void {
    this.store.dispatch(new CreateList(list));
    gtag('event', 'List', {
      'event_label': 'creation',
      'non_interaction': true
    });
  }

  deleteList(key: string, offline: boolean): void {
    this.store.dispatch(new DeleteList(key, offline));
    gtag('event', 'List', {
      'event_label': 'deletion',
      'non_interaction': true
    });
  }

  updateList(list: List, updateCompact = false, force = false): void {
    this.store.dispatch(new UpdateList(list, updateCompact, force));
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
    this.store.dispatch(new LoadSharedLists());
  }

  load(key: string): void {
    this.store.dispatch(new LoadListDetails(key));
  }

  unload(key: string): void {
    this.store.dispatch(new SelectList(undefined));
  }

  toggleAutocomplete(newValue: boolean): void {
    this.store.dispatch(new ToggleAutocompletion(newValue));
    if (newValue) {
      this.userInventoryService.inventory$.pipe(
        first(),
        filter((inventory) => {
          if (!inventory.lastZone) {
            return true;
          }
          return inventory.lastZone.seconds < environment.startTimestamp / 1000;
        }),
        map(() => {
          return this.dialog.create({
            nzTitle: this.translate.instant('PACKET_CAPTURE.Inventory_outdated'),
            nzContent: this.translate.instant('PACKET_CAPTURE.Please_update_inventory_popup'),
            nzClosable: true,
            nzFooter: null,
            nzMaskClosable: false
          });
        }),
        switchMap((modal) => {
          return this.userInventoryService.inventory$.pipe(
            filter(inventory => inventory.lastZone.seconds > environment.startTimestamp / 1000),
            first(),
            map(() => modal)
          );
        })
      ).subscribe(modal => {
        modal.close();
      });
    }
  }

  toggleCompletionNotification(newValue: boolean): void {
    this.store.dispatch(new ToggleCompletionNotification(newValue));
  }

  setNeedsverification(needed: boolean): void {
    this.store.dispatch(new NeedsVerification(needed));
  }

  offlineListsLoaded(lists: List[]): void {
    this.store.dispatch(new OfflineListsLoaded(lists));
  }

  loadAndWait(key: string): Observable<List> {
    this.load(key);
    return this.allListDetails$.pipe(
      map(details => details.find(l => l.$key === key)),
      filter(list => list !== undefined),
      first()
    );
  }

  select(key: string): void {
    this.store.dispatch(new SelectList(key, this.settings.enableAutofillByDefault));
    if (this.settings.enableAutofillNotificationByDefault) {
      this.store.dispatch(new ToggleCompletionNotification(true));
    }
  }

  pin(key: string): void {
    this.store.dispatch(new PinList(key));
  }

  unpin(): void {
    this.store.dispatch(new UnPinList());
  }

  sortLists(lists: List[]): List[] {
    return lists
      .sort((a, b) => {
        if (a.index === b.index) {
          return b.createdAt.toMillis() - a.createdAt.toMillis();
        }
        return a.index - b.index;
      });
  }
}
