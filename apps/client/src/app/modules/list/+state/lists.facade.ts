import { Injectable } from '@angular/core';

import { Store } from '@ngrx/store';

import { ListsState } from './lists.reducer';
import { listsQuery } from './lists.selectors';
import {
  ClearModificationsHistory,
  CreateList,
  DeleteList,
  DeleteLists,
  ListDetailsLoaded,
  LoadArchivedLists,
  LoadListDetails,
  LoadMyLists,
  LoadSharedLists,
  LoadTeamLists,
  MarkItemsHq,
  NeedsVerification,
  OfflineListsLoaded,
  PinList,
  PureUpdateList,
  SelectList,
  SetItemDone,
  ToggleAutocompletion,
  ToggleCompletionNotification,
  UnLoadArchivedLists,
  UnloadListDetails,
  UnPinList,
  UpdateItem,
  UpdateList,
  UpdateListIndexes
} from './lists.actions';
import { List } from '../model/list';
import { NameQuestionPopupComponent } from '../../name-question-popup/name-question-popup/name-question-popup.component';
import { distinctUntilChanged, filter, first, map, mergeMap, shareReplay, switchMap, tap } from 'rxjs/operators';
import { NzModalService } from 'ng-zorro-antd/modal';
import { TranslateService } from '@ngx-translate/core';
import { combineLatest, concat, Observable, of } from 'rxjs';
import { AuthFacade } from '../../../+state/auth.facade';
import { PermissionLevel } from '../../../core/database/permissions/permission-level.enum';
import { ListRow } from '../model/list-row';
import { TeamsFacade } from '../../teams/+state/teams.facade';
import { Team } from '../../../model/team/team';
import { SettingsService } from '../../settings/settings.service';
import { environment } from '../../../../environments/environment';
import { NavigationEnd, Router } from '@angular/router';
import { NgSerializerService } from '@kaiu/ng-serializer';
import { ItemPickerService } from '../../item-picker/item-picker.service';
import { ListManagerService } from '../list-manager.service';
import { ProgressPopupService } from '../../progress-popup/progress-popup.service';
import { InventoryService } from '../../inventory/inventory.service';
import { FirestoreListStorage } from '../../../core/database/storage/list/firestore-list-storage';
import { ModificationEntry } from '../model/modification-entry';
import { PermissionsController } from '../../../core/database/permissions-controller';
import { ListController } from '../list-controller';

declare const gtag: Function;
declare const fathom: any;

@Injectable({
  providedIn: 'root'
})
export class ListsFacade {
  loadingMyLists$ = this.store.select(listsQuery.getListsLoading);

  connectedTeams$ = this.store.select(listsQuery.getConnectedTeams);

  allListDetails$ = this.store.select(listsQuery.getAllListDetails)
    .pipe(
      map(lists => {
        return lists.filter(list => {
          return list.finalItems !== undefined
            && list.items !== undefined;
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
                && PermissionsController.getPermissionLevel(c, userId) >= PermissionLevel.READ
                && PermissionsController.hasExplicitPermissions(c, userId)
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
                && Math.max(PermissionsController.getPermissionLevel(c, userId), PermissionsController.getPermissionLevel(c, fcId)) >= PermissionLevel.READ
                && (PermissionsController.hasExplicitPermissions(c, userId) || PermissionsController.hasExplicitPermissions(c, fcId))
                && c.authorId !== userId;
            })
          );
        })
      );
    }),
    shareReplay(1)
  );

  public listsWithWriteAccess$ = combineLatest([this.allListDetails$, this.authFacade.user$, this.authFacade.userId$, this.authFacade.fcId$, this.teamsFacade.myTeams$]).pipe(
    map(([compacts, user, userId, fcId, teams]) => {
      if (user !== null) {
        const idEntry = user.lodestoneIds.find(l => l.id === user.defaultLodestoneId);
        const verified = idEntry && idEntry.verified;
        if (!verified) {
          fcId = null;
        }
      }
      return this.sortLists(
        compacts.filter(c => {
          const hasFcPermission = Math.max(PermissionsController.getPermissionLevel(c, userId), PermissionsController.getPermissionLevel(c, fcId)) >= PermissionLevel.WRITE;
          const hasTeamPermission = teams.map(team => `team:${team.$key}`).some(key => {
            return PermissionsController.getPermissionLevel(c, key) >= PermissionLevel.WRITE;
          });
          return !c.notFound
            && (hasFcPermission || hasTeamPermission)
            && c.authorId !== userId;
        })
      );
    })
  );

  selectedListKey$ = this.store.select(listsQuery.getSelectedId);

  selectedList$ = this.store.select(listsQuery.getSelectedList()).pipe(
    filter(list => list !== undefined),
    shareReplay(1)
  );

  selectedListPermissionLevel$ = this.authFacade.loggedIn$.pipe(
    switchMap(loggedIn => {
      return combineLatest([
        this.selectedList$,
        loggedIn ? this.authFacade.user$ : of(null),
        this.authFacade.userId$,
        this.teamsFacade.selectedTeam$,
        loggedIn ? this.authFacade.fcId$ : of(null)
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
      let teamPermissionLevel = 0;
      if (team !== undefined && list.teamId === team.$key) {
        teamPermissionLevel = Math.max(PermissionsController.getPermissionLevel(list, `team:${list.teamId}`), 20);
      }
      return Math.max(PermissionsController.getPermissionLevel(list, userId), PermissionsController.getPermissionLevel(list, fcId), teamPermissionLevel);
    }),
    distinctUntilChanged(),
    shareReplay(1)
  );

  needsVerification$ = this.store.select(listsQuery.getNeedsVerification);

  autocompleteEnabled$ = this.store.select(listsQuery.getAutocompleteEnabled);

  pinnedList$ = this.store.select(listsQuery.getPinnedListKey());

  completionNotificationEnabled$ = this.store.select(listsQuery.getCompletionNotificationEnabled);

  private overlay: boolean;

  constructor(private store: Store<{ lists: ListsState }>, private dialog: NzModalService, private translate: TranslateService, private authFacade: AuthFacade,
              private teamsFacade: TeamsFacade, private settings: SettingsService, private userInventoryService: InventoryService,
              private router: Router, private serializer: NgSerializerService, private itemPicker: ItemPickerService,
              private listManager: ListManagerService, private progress: ProgressPopupService,
              private listService: FirestoreListStorage) {
    router.events
      .pipe(
        distinctUntilChanged((previous: any, current: any) => {
          if (current instanceof NavigationEnd) {
            return previous.url === current.url;
          }
          return true;
        })
      ).subscribe((event: any) => {
      this.overlay = event.url.indexOf('?overlay') > -1;
    });
  }

  removeModificationsHistoryEntry(key: string, entryId: string): Observable<void> {
    return this.listService.removeModificationsHistoryEntry(key, entryId);
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

  loadArchivedLists(): void {
    this.store.dispatch(new LoadArchivedLists());
  }

  unLoadArchivedLists(): void {
    this.store.dispatch(new UnLoadArchivedLists());
  }

  deleteLists(keys: string[]): void {
    this.store.dispatch(new DeleteLists(keys));
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
        const list = this.newListWithName(res.name);
        list.ephemeral = res.ephemeral;
        list.offline = res.offline;
        fathom.trackGoal('AYCCVISE', 0);
        return list;
      })
    );
  }

  newEphemeralList(itemName: string): List {
    this.loadMyLists();
    const list = this.newListWithName(itemName);
    list.ephemeral = true;
    list.offline = this.settings.makeQuickListsOffline;
    return list;
  }

  newListWithName(name: string): List {
    const list = new List(this.settings);
    list.name = name;
    return list;
  }

  setItemDone(itemId: number, itemIcon: number, finalItem: boolean, delta: number, recipeId: string, totalNeeded: number, external = false, fromPacket = false, hq = false): void {
    this.store.dispatch(new SetItemDone(itemId, itemIcon, finalItem, delta, recipeId, totalNeeded, {
      enableAutofillHQFilter: this.settings.enableAutofillHQFilter,
      enableAutofillNQFilter: this.settings.enableAutofillNQFilter
    }, external, fromPacket, hq));
  }

  markAsHq(itemIds: number[], hq: boolean): void {
    this.store.dispatch(new MarkItemsHq(itemIds, hq));
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

  addListAndWait(list: List): Observable<List> {
    this.addList(list);
    return this.allListDetails$.pipe(
      map(lists => {
        return lists.find(l => l.createdAt.seconds === list.createdAt.seconds && l.items.length === list.items.length && l.name === list.name);
      }),
      filter(l => !!l),
      first()
    );
  }

  deleteList(key: string, offline: boolean): void {
    this.store.dispatch(new DeleteList(key, offline));
    gtag('event', 'List', {
      'event_label': 'deletion',
      'non_interaction': true
    });
  }

  updateList(list: List, updateCompact = false, force = false): void {
    this.store.dispatch(new UpdateList(ListController.clone(list, true), updateCompact, force));
  }

  clearModificationsHistory(list: List): void {
    this.store.dispatch(new ClearModificationsHistory(list));
  }

  pureUpdateList($key: string, data: Partial<List>): void {
    this.store.dispatch(new PureUpdateList($key, data));
  }

  loadTeamLists(teamId: string): void {
    this.store.dispatch(new LoadTeamLists(teamId));
  }

  updateListIndexes(lists: List[]): void {
    this.store.dispatch(new UpdateListIndexes(lists));
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
    this.store.dispatch(new UnloadListDetails(key));
  }

  toggleAutocomplete(newValue: boolean): void {
    this.store.dispatch(new ToggleAutocompletion(newValue));
    if (newValue && !this.overlay) {
      this.userInventoryService.inventory$.pipe(
        first(),
        filter((inventory) => {
          if (!inventory.lastZone) {
            return true;
          }
          return inventory.lastZone < environment.startTimestamp;
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
            filter(inventory => inventory.lastZone > environment.startTimestamp),
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
    this.store.dispatch(new SelectList(key));
    if (this.settings.enableAutofillByDefault) {
      this.toggleAutocomplete(true);
    }
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
          return b.createdAt.seconds - a.createdAt.seconds;
        }
        return a.index - b.index;
      });
  }

  overlayListsLoaded(data: List[]): void {
    const lists = this.serializer.deserialize<List>(data, [List]);
    lists.filter(l => !l.offline).forEach(list => {
      this.store.dispatch(new ListDetailsLoaded(list));
    });
    const offline = lists.filter(l => l.offline);
    if (offline.length > 0) {
      this.offlineListsLoaded(offline);
    }
  }

  /**
   * Gets progression % as a [0,100] float
   * @param items the items to build progression on.
   */
  public buildProgression(items: ListRow[]): number {
    if (items.length === 0) {
      return 0;
    }
    return 100 * items.reduce((acc, item) => {
      acc += item.done / item.amount;
      return acc;
    }, 0) / items.length;
  }

  addItems(list: List): Observable<any> {
    return this.itemPicker.pickItems().pipe(
      filter(items => items?.length > 0),
      switchMap((items) => {
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
        return this.progress.showProgress(operation$,
          items.length,
          'Adding_recipes',
          { amount: items.length, listname: list.name });
      }),
      tap(l => list.$key ? this.updateList(l) : this.addList(l)),
      mergeMap(updatedList => {
        // We want to get the list created before calling it a success, let's be pessimistic !
        return this.progress.showProgress(
          combineLatest([this.myLists$, this.listsWithWriteAccess$]).pipe(
            map(([myLists, listsICanWrite]) => [...myLists, ...listsICanWrite]),
            map(lists => lists.find(l => l.createdAt.seconds === updatedList.createdAt.seconds && l.$key !== undefined)),
            filter(l => l !== undefined),
            first()
          ), 1, 'Saving_in_database');
      })
    );

  }

  addModificationsHistoryEntry(entry: ModificationEntry): void {
    // TODO local history
  }
}
