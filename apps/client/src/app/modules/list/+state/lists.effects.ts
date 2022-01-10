import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import {
  ArchivedListsLoaded,
  ConvertLists,
  CreateList,
  DeleteList,
  DeleteLists,
  ListDetailsLoaded,
  ListsActionTypes,
  LoadListDetails,
  LoadTeamLists,
  MarkItemsHq,
  MyListsLoaded,
  PureUpdateList,
  SetItemDone,
  SharedListsLoaded,
  TeamListsLoaded,
  UpdateItem,
  UpdateList,
  UpdateListIndexes,
  UpdateListProgress,
  UpdateSelectedClone
} from './lists.actions';
import {
  catchError,
  debounceTime,
  delay,
  distinctUntilChanged,
  exhaustMap,
  filter,
  first,
  map,
  mergeMap,
  switchMap,
  tap,
  withLatestFrom
} from 'rxjs/operators';
import { AuthFacade } from '../../../+state/auth.facade';
import { TeamcraftUser } from '../../../model/user/teamcraft-user';
import { combineLatest, EMPTY, from, of } from 'rxjs';
import { ListsFacade } from './lists.facade';
import { List } from '../model/list';
import { PermissionLevel } from '../../../core/database/permissions/permission-level.enum';
import { Team } from '../../../model/team/team';
import { TeamsFacade } from '../../teams/+state/teams.facade';
import { DiscordWebhookService } from '../../../core/discord/discord-webhook.service';
import { Router } from '@angular/router';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ListCompletionPopupComponent } from '../list-completion-popup/list-completion-popup.component';
import { TranslateService } from '@ngx-translate/core';
import { NgSerializerService } from '@kaiu/ng-serializer';
import { FirestoreListStorage } from '../../../core/database/storage/list/firestore-list-storage';
import { PlatformService } from '../../../core/tools/platform.service';
import { IpcService } from '../../../core/electron/ipc.service';
import { SettingsService } from '../../settings/settings.service';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { onlyIfNotConnected } from '../../../core/rxjs/only-if-not-connected';
import { DirtyFacade } from '../../../core/dirty/+state/dirty.facade';
import { CommissionService } from '../../commission-board/commission.service';
import { SoundNotificationService } from '../../../core/sound-notification/sound-notification.service';
import { SoundNotificationType } from '../../../core/sound-notification/sound-notification-type';
import { Action } from '@ngrx/store';
import { ListController } from '../list-controller';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { withLazyRow } from '../../../core/rxjs/with-lazy-row';
import { ListPricingService } from '../../../pages/list-details/list-pricing/list-pricing.service';

// noinspection JSUnusedGlobalSymbols
@Injectable()
export class ListsEffects {


  loadArchivedLists$ = createEffect(() => this.actions$.pipe(
    ofType(ListsActionTypes.LoadArchivedLists),
    switchMap(() => this.authFacade.userId$),
    distinctUntilChanged(),
    exhaustMap((userId) => {
      return this.listService.getByForeignKey(TeamcraftUser, userId, query => query.where('archived', '==', true), ':archived')
        .pipe(
          map(lists => new ArchivedListsLoaded(lists, userId))
        );
    })
  ));

  loadTeamLists$ = createEffect(() => this.actions$.pipe(
    ofType<LoadTeamLists>(ListsActionTypes.LoadTeamLists),
    withLatestFrom(this.listsFacade.connectedTeams$),
    filter(([action, teams]) => teams.indexOf(action.teamId) === -1),
    map(([action]) => action),
    mergeMap((action) => {
      return this.listService.getByForeignKey(Team, action.teamId)
        .pipe(
          map(lists => new TeamListsLoaded(lists, action.teamId))
        );
    })
  ));

  loadSharedLists$ = createEffect(() => this.actions$.pipe(
    ofType(ListsActionTypes.LoadSharedLists),
    first(),
    switchMap(() => combineLatest([this.authFacade.user$, this.authFacade.fcId$])),
    distinctUntilChanged(),
    switchMap(([user, fcId]) => {
      // First of all, load using user Id
      return this.listService.getShared(user.$key).pipe(
        switchMap((lists) => {
          // If we don't have fc informations yet, return the lists directly.
          if (!fcId) {
            return of(lists);
          }
          // Else add fc lists
          return this.listService.getShared(fcId).pipe(
            map(fcLists => {
              const idEntry = user.lodestoneIds.find(l => l.id === user.defaultLodestoneId);
              const verified = idEntry && idEntry.verified;
              if (!verified) {
                this.listsFacade.setNeedsverification(true);
                return lists;
              }
              this.listsFacade.setNeedsverification(false);
              return [...lists, ...fcLists];
            })
          );
        })
      );
    }),
    map(lists => new SharedListsLoaded(lists))
  ));

  loadListDetails$ = createEffect(() => this.actions$.pipe(
    ofType<LoadListDetails>(ListsActionTypes.LoadListDetails),
    filter(action => !/^offline\d+$/.test(action.key)),
    onlyIfNotConnected(this.listsFacade.allListDetails$, action => action.key),
    mergeMap((action: LoadListDetails) => {
      return this.authFacade.loggedIn$.pipe(
        switchMap(loggedIn => {
          return combineLatest([
            of(action.key),
            loggedIn ? this.authFacade.user$ : of(null),
            this.authFacade.userId$,
            this.teamsFacade.selectedTeam$,
            loggedIn ? this.authFacade.mainCharacter$.pipe(map(c => c.FreeCompanyId)) : of(null),
            this.listService.get(action.key).pipe(catchError(() => of(null)))
          ]);
        })
      );
    }),
    map(([listKey, user, userId, team, fcId, list]: [string, TeamcraftUser | null, string, Team, string | null, List]) => {
      if (user !== null) {
        const idEntry = user.lodestoneIds.find(l => l.id === user.defaultLodestoneId);
        const verified = idEntry && idEntry.verified;
        if (!verified) {
          fcId = null;
        }
      }
      if (list !== null && !list.notFound) {
        const permissionLevel = Math.max(list.getPermissionLevel(userId), list.getPermissionLevel(fcId), (team !== undefined && list.teamId === team.$key) ? 20 : 0);
        if (permissionLevel >= PermissionLevel.READ) {
          return [listKey, list];
        }
        if (team === undefined && list.teamId !== undefined) {
          this.teamsFacade.select(list.teamId);
        }
      }
      return [listKey, null];
    }),
    map(([key, list]: [string, List]) => {
      if (list === null) {
        return new ListDetailsLoaded({ $key: key, notFound: true });
      }
      return new ListDetailsLoaded(list);
    })
  ));

  persistUpdateListIndexes$ = createEffect(() => this.actions$.pipe(
    ofType<UpdateListIndexes>(ListsActionTypes.UpdateListIndexes),
    mergeMap(action => {
      const todo = action.lists.reduce((acc, list) => {
        if (list.offline) {
          acc.offline.push(list);
        } else {
          acc.online.push(list);
        }
        return acc;
      }, { offline: [], online: [] });
      todo.offline.forEach(list => {
        this.saveToLocalstorage(list, false);
      });
      if (todo.online.length === 0) {
        return EMPTY;
      }
      return this.listService.updateIndexes(todo.online);
    })
  ), { dispatch: false });

  createListInDatabase$ = createEffect(() => this.actions$.pipe(
    ofType(ListsActionTypes.CreateList),
    withLatestFrom(this.authFacade.userId$),
    map(([action, userId]) => {
      (<CreateList>action).payload.authorId = userId;
      return (<CreateList>action).payload;
    }),
    switchMap(list => {
        if (list.offline) {
          list.$key = `offline${Math.floor(Math.random() * 1000000000)}`;
          this.saveToLocalstorage(list, true);
          return EMPTY;
        }
        if (list.$key) {
          return this.listService.set(list.$key, list);
        }
        return this.listService.add(list);
      }
    )
  ), { dispatch: false });

  updateListProgressInDatabase$ = createEffect(() => this.actions$.pipe(
    ofType<UpdateListProgress>(ListsActionTypes.UpdateListProgress),
    debounceTime(1000),
    withLatestFrom(this.listsFacade.selectedListPermissionLevel$),
    filter(([, permission]) => {
      return permission < PermissionLevel.WRITE;
    }),
    map(([action]) => action),
    withLatestFrom(this.listsFacade.selectedClone$),
    switchMap(([action, clone]) => {
      if (action.payload.offline) {
        this.saveToLocalstorage(action.payload, false);
        return of(null);
      }
      if (action.payload.hasCommission) {
        this.updateCommission(action.payload);
      }
      if (ListController.isLarge(action.payload)) {
        return this.listService.set(action.payload.$key, action.payload);
      }
      return this.listService.update(action.payload.$key, clone, action.payload);
    })
  ), { dispatch: false });

  updateCloneList$ = createEffect(() => this.actions$.pipe(
    ofType<Action & { payload: List[] }>(
      ListsActionTypes.MyListsLoaded,
      ListsActionTypes.SharedListsLoaded,
      ListsActionTypes.ListsForTeamsLoaded,
      ListsActionTypes.TeamListsLoaded,
      ListsActionTypes.ArchivedListsLoaded
    ),
    withLatestFrom(this.listsFacade.selectedListKey$),
    switchMap(([{ payload }, key]) => {
      const selected = payload.find(l => l.$key === key);
      if (selected) {
        return of(new UpdateSelectedClone(this.listService.prepareData(ListController.clone(selected, true))));
      }
      return EMPTY;
    })
  ));

  updateListInDatabase$ = createEffect(() => this.actions$.pipe(
    ofType<UpdateList>(ListsActionTypes.UpdateList),
    debounceTime(1000),
    switchMap((action) => {
      if (action.payload.offline) {
        this.saveToLocalstorage(action.payload, false);
        return of(null);
      }
      if (action.payload.hasCommission) {
        this.updateCommission(action.payload);
      }
      return this.listService.set(action.payload.$key, action.payload);
    })
  ), { dispatch: false });

  convertListsAfterRegister$ = createEffect(() => this.actions$.pipe(
    ofType<ConvertLists>(ListsActionTypes.ConvertLists),
    withLatestFrom(this.listsFacade.myLists$),
    switchMap(([action, lists]) => {
      return from(
        lists.map(list => {
          list.authorId = action.uid;
          return new UpdateList(list);
        })
      );
    })
  ));

  deleteListFromDatabase$ = createEffect(() => this.actions$.pipe(
    ofType<DeleteList>(ListsActionTypes.DeleteList),
    withLatestFrom(this.listsFacade.pinnedList$),
    mergeMap(([action, pin]) => {
      if (pin === action.key) {
        this.listsFacade.unpin();
      }
      this.pricingService.removeEntriesForList(action.key);
      if (action.offline) {
        this.removeFromLocalStorage(action.key);
        return EMPTY;
      }
      return this.listService.remove(action.key);
    })
  ), { dispatch: false });

  deleteListsFromDatabase$ = createEffect(() => this.actions$.pipe(
    ofType<DeleteLists>(ListsActionTypes.DeleteLists),
    switchMap(({ keys }) => {
      return this.listService.removeMany(keys);
    })
  ), { dispatch: false });

  markItemsHq = createEffect(() => this.actions$.pipe(
    ofType<MarkItemsHq>(ListsActionTypes.MarkItemsHq),
    withLatestFrom(this.listsFacade.selectedList$),
    map(([{ itemIds, hq }, list]) => {
      list.items = list.items.map(i => {
        if (itemIds.includes(i.id)) {
          return {
            ...i,
            requiredAsHQ: hq
          };
        }
        return i;
      });
      return new UpdateList(list);
    })
  ));

  updateItemDone$ = createEffect(() => this.actions$.pipe(
    ofType<SetItemDone>(ListsActionTypes.SetItemDone),
    withLatestFrom(this.listsFacade.selectedList$,
      this.teamsFacade.selectedTeam$,
      this.authFacade.userId$,
      this.authFacade.fcId$,
      this.listsFacade.autocompleteEnabled$,
      this.listsFacade.completionNotificationEnabled$),
    filter(([action, list, , , , autofillEnabled, _]) => {
      const item = ListController.getItemById(list, action.itemId, !action.finalItem, action.finalItem);
      const requiredHq = ListController.requiredAsHQ(list, item) > 0;
      if (autofillEnabled && this.settings.enableAutofillHQFilter && requiredHq) {
        return !action.fromPacket || action.hq;
      }
      if (autofillEnabled && this.settings.enableAutofillNQFilter && !requiredHq) {
        return !action.fromPacket || !action.hq;
      }
      return true;
    }),
    withLazyRow(this.lazyData, 'itemIcons', ([action]) => action.itemId),
    switchMap(([[action, list, team, userId, fcId, autofillEnabled, completionNotificationEnabled], icon]) => {
      const item = ListController.getItemById(list, action.itemId, !action.finalItem, action.finalItem);
      const historyEntry = list.modificationsHistory.find(entry => {
        return entry.itemId === action.itemId && (Date.now() - entry.date < 600000);
      });
      if (historyEntry !== undefined) {
        historyEntry.amount += action.doneDelta;
      } else {
        list.modificationsHistory.unshift({
          amount: action.doneDelta,
          date: Date.now(),
          itemId: action.itemId,
          itemIcon: action.itemIcon,
          userId: userId,
          finalItem: action.finalItem,
          total: action.totalNeeded,
          recipeId: action.recipeId
        });
      }
      if (team && list.teamId === team.$key && action.doneDelta > 0) {
        this.discordWebhookService.notifyItemChecked(team, list, userId, fcId, action.doneDelta, action.itemId, action.totalNeeded, action.finalItem);
      }
      if (autofillEnabled && completionNotificationEnabled && action.fromPacket) {
        const itemDone = item.done + action.doneDelta >= item.amount;
        if (itemDone) {
          return this.i18n.getNameObservable('items', action.itemId).pipe(
            map(itemName => {
              const notificationTitle = this.translate.instant('LIST_DETAILS.Autofill_notification_title');
              const notificationBody = this.translate.instant('LIST_DETAILS.Autofill_notification_body', {
                itemName,
                listName: list.name
              });
              const notificationIcon = `https://xivapi.com${icon}`;
              this.soundNotificationService.play(SoundNotificationType.AUTOFILL);
              if (this.platform.isDesktop()) {
                this.ipc.send('notification', {
                  title: notificationTitle,
                  content: notificationBody,
                  icon: notificationIcon
                });
              }
              this.notificationService.info(notificationTitle, notificationBody);
              return [action, list];
            })
          );
        }
      }
      return of([action, list]);
    }),
    map(([action, list]: [SetItemDone, List]) => {
      ListController.setDone(list, action.itemId, action.doneDelta, !action.finalItem, action.finalItem, false, action.recipeId, action.external);
      ListController.updateAllStatuses(list, action.itemId);
      if (list.hasCommission) {
        this.updateCommission(list);
      }
      if (this.settings.autoMarkAsCompleted && action.doneDelta > 0) {
        if (action.recipeId) {
          this.markAsDoneInDoHLog(+(action.recipeId));
        } else {
          this.markAsDoneInDoLLog(action.itemId);
        }
      }
      return new UpdateListProgress(list, action.fromPacket);
    })
  ));

  deleteEphemeralListsOnComplete$ = createEffect(() => this.actions$.pipe(
    ofType<UpdateList>(ListsActionTypes.UpdateList, ListsActionTypes.UpdateListProgress, ListsActionTypes.UpdateListAtomic),
    filter(action => action.payload.ephemeral && ListController.isComplete(action.payload)),
    map(action => new DeleteList(action.payload.$key, action.payload.offline)),
    delay(500),
    tap(() => this.router.navigate(['/lists']))
  ));

  updateItem$ = createEffect(() => this.actions$.pipe(
    ofType<UpdateItem>(ListsActionTypes.UpdateItem),
    withLatestFrom(this.listsFacade.selectedList$),
    map(([action, list]) => {
      const items = action.finalItem ? list.finalItems : list.items;
      const updatedItems = items.map(item => item.id === action.item.id ? action.item : item);
      if (action.finalItem) {
        list.finalItems = updatedItems;
        if (list.hasCommission) {
          this.updateCommission(list);
        }
      } else {
        list.items = updatedItems;
      }
      return list;
    }),
    map(list => new UpdateListProgress(list, false))
  ));

  openCompletionPopup$ = createEffect(() => this.actions$.pipe(
    ofType<SetItemDone>(ListsActionTypes.SetItemDone),
    withLatestFrom(this.listsFacade.selectedList$, this.authFacade.userId$),
    filter(([, list, userId]) => {
      return !list.ephemeral && list.authorId === userId && ListController.isComplete(list);
    }),
    debounceTime(2000),
    tap(([, list]) => {
      if (!list.hasCommission) {
        this.dialog.create({
          nzTitle: this.translate.instant('LIST.COMPLETION_POPUP.Title'),
          nzFooter: null,
          nzContent: ListCompletionPopupComponent,
          nzComponentParams: {
            list: list
          }
        });
      }
    })
  ), { dispatch: false });

  private localStore: List[] = [];

  loadMyLists$ = createEffect(() => this.actions$.pipe(
    ofType(ListsActionTypes.LoadMyLists),
    switchMap(() => this.authFacade.userId$),
    distinctUntilChanged(),
    exhaustMap((userId) => {
      this.localStore = this.serializer.deserialize<List>(JSON.parse(localStorage.getItem('offline-lists') || '[]'), [List]);
      this.localStore.forEach(list => ListController.afterDeserialized(list));
      this.listsFacade.offlineListsLoaded(this.localStore);
      return this.listService.getByForeignKey(TeamcraftUser, userId, query => query.where('archived', '==', false))
        .pipe(
          debounceTime(100),
          tap(lists => {
            lists.forEach(list => {
              if (!list.name) {
                this.listsFacade.deleteList(list.$key, false);
              }
            });
          }),
          map(lists => new MyListsLoaded(lists, userId))
        );
    })
  ));

  loadOfflineListDetails$ = createEffect(() => this.actions$.pipe(
    ofType<LoadListDetails>(ListsActionTypes.LoadListDetails),
    filter(action => /^offline\d+$/.test(action.key)),
    map((action) => {
      const list = this.localStore.find(c => c.$key === action.key);
      if (list === undefined) {
        return new ListDetailsLoaded({ $key: action.key, notFound: true });
      }
      return new ListDetailsLoaded(list);
    })
  ));

  pureListUpdate$ = createEffect(() => this.actions$.pipe(
    ofType<PureUpdateList>(ListsActionTypes.PureUpdateList),
    mergeMap(action => {
      const localList = this.localStore.find(l => l.$key === action.$key);
      if (localList) {
        Object.assign(localList, action.payload);
        this.saveToLocalstorage(localList, false);
        return EMPTY;
      }
      return this.listService.pureUpdate(action.$key, action.payload);
    })
  ), { dispatch: false });

  constructor(
    private actions$: Actions,
    private authFacade: AuthFacade,
    private listService: FirestoreListStorage,
    private listsFacade: ListsFacade,
    private teamsFacade: TeamsFacade,
    private router: Router,
    private dialog: NzModalService,
    private translate: TranslateService,
    private discordWebhookService: DiscordWebhookService,
    private serializer: NgSerializerService,
    private notificationService: NzNotificationService,
    private platform: PlatformService,
    private ipc: IpcService,
    private settings: SettingsService,
    private i18n: I18nToolsService,
    private lazyData: LazyDataFacade,
    private dirtyFacade: DirtyFacade,
    private commissionService: CommissionService,
    private soundNotificationService: SoundNotificationService,
    private pricingService: ListPricingService
  ) {
  }

  private updateCommission(list: List): void {
    this.commissionService.pureUpdate(list.$key, {
      materialsProgression: this.listsFacade.buildProgression(list.items),
      itemsProgression: this.listsFacade.buildProgression(list.finalItems),
      items: list.finalItems.map(item => ({
        id: item.id,
        amount: item.amount,
        done: item.done
      })),
      totalItems: list.finalItems.reduce((acc, item) => acc + item.amount, 0)
    }).subscribe();
  }

  private markAsDoneInDoHLog(recipeId: number): void {
    this.authFacade.markAsDoneInLog('crafting', recipeId, true);
  }

  private markAsDoneInDoLLog(itemId: number): void {
    this.authFacade.markAsDoneInLog('gathering', itemId, true);
  }

  private saveToLocalstorage(list: List, newList: boolean): void {
    if (newList) {
      this.localStore = [
        ...this.localStore,
        list
      ];
    } else {
      this.localStore = [...this.localStore.map(l => {
        if (l.$key === list.$key) {
          return this.serializer.deserialize<List>({ ...list }, List);
        }
        return l;
      })];
    }
    this.persistLocalStore();
  }

  private removeFromLocalStorage(key: string): void {
    this.localStore = [...this.localStore.filter(l => {
      return l.$key !== key;
    })];
    this.persistLocalStore();
  }

  private persistLocalStore(): void {
    localStorage.setItem('offline-lists', this.serializer.serialize(this.localStore));
    this.listsFacade.offlineListsLoaded(this.localStore);
  }
}
