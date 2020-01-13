import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import {
  ConvertLists,
  CreateList,
  DeleteList,
  ListDetailsLoaded,
  ListsActionTypes,
  ListsForTeamsLoaded,
  LoadListDetails,
  LoadTeamLists,
  MyListsLoaded,
  SetItemDone,
  SharedListsLoaded,
  TeamListsLoaded,
  UpdateItem,
  UpdateList,
  UpdateListAtomic,
  UpdateListIndex
} from './lists.actions';
import {
  catchError,
  debounceTime,
  delay,
  distinctUntilChanged,
  filter,
  first,
  map,
  mergeMap,
  switchMap,
  tap,
  throttleTime,
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
import { NzModalService, NzNotificationService } from 'ng-zorro-antd';
import { ListCompletionPopupComponent } from '../list-completion-popup/list-completion-popup.component';
import { TranslateService } from '@ngx-translate/core';
import { NgSerializerService } from '@kaiu/ng-serializer';
import { FirestoreListStorage } from '../../../core/database/storage/list/firestore-list-storage';
import { PushNotificationsService } from 'ng-push';
import { PlatformService } from '../../../core/tools/platform.service';
import { IpcService } from '../../../core/electron/ipc.service';
import { SettingsService } from '../../settings/settings.service';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { LocalizedDataService } from '../../../core/data/localized-data.service';
import { LazyDataService } from '../../../core/data/lazy-data.service';

@Injectable()
export class ListsEffects {

  @Effect()
  loadMyLists$ = this.actions$.pipe(
    ofType(ListsActionTypes.LoadMyLists),
    switchMap(() => this.authFacade.userId$),
    distinctUntilChanged(),
    switchMap((userId) => {
      this.localStore = this.serializer.deserialize<List>(JSON.parse(localStorage.getItem('offline-lists') || '[]'), [List]);
      this.localStore.forEach(list => list.afterDeserialized());
      this.listsFacade.offlineListsLoaded(this.localStore);
      return this.listService.getByForeignKey(TeamcraftUser, userId)
        .pipe(
          map(lists => new MyListsLoaded(lists, userId))
        );
    })
  );

  @Effect()
  loadTeamLists$ = this.actions$.pipe(
    ofType<LoadTeamLists>(ListsActionTypes.LoadTeamLists),
    mergeMap((action) => {
      return this.listService.getByForeignKey(Team, action.teamId)
        .pipe(
          map(lists => new TeamListsLoaded(lists, action.teamId))
        );
    })
  );

  @Effect()
  loadListsWithWriteAccess$ = this.actions$.pipe(
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
  );

  @Effect()
  loadListsForTeam$ = this.teamsFacade.myTeams$.pipe(
    switchMap((teams) => {
      return combineLatest(teams.map(team => this.listService.getByForeignKey(Team, team.$key)));
    }),
    map(listsArrays => [].concat.apply([], ...listsArrays)),
    map(lists => new ListsForTeamsLoaded(lists))
  );

  @Effect()
  loadListDetails$ = this.actions$.pipe(
    ofType<LoadListDetails>(ListsActionTypes.LoadListDetails),
    filter(action => !/^offline\d+$/.test(action.key)),
    withLatestFrom(this.listsFacade.allListDetails$),
    filter(([action, allLists]) => allLists.find(list => list.$key === action.key) === undefined),
    map(([action]) => action),
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
      if (list !== null) {
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
  );

  @Effect()
  loadOfflineListDetails$ = this.actions$.pipe(
    ofType<LoadListDetails>(ListsActionTypes.LoadListDetails),
    filter(action => /^offline\d+$/.test(action.key)),
    map((action) => {
      const list = this.localStore.find(c => c.$key === action.key);
      if (list === undefined) {
        return new ListDetailsLoaded({ $key: action.key, notFound: true });
      }
      return new ListDetailsLoaded(list);
    })
  );

  @Effect()
  persistUpdateListIndex$ = this.actions$.pipe(
    ofType<UpdateListIndex>(ListsActionTypes.UpdateListIndex),
    mergeMap(action => {
      if (action.payload.offline) {
        this.saveToLocalstorage(action.payload, false);
        return EMPTY;
      }
      return this.listService.pureUpdate(action.payload.$key, { index: action.payload.index });
    }),
    switchMap(() => EMPTY)
  );

  @Effect({ dispatch: false })
  createListInDatabase$ = this.actions$.pipe(
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
        return this.listService.add(list);
      }
    )
  );

  @Effect({ dispatch: false })
  updateListInDatabase$ = this.actions$.pipe(
    ofType<UpdateList>(ListsActionTypes.UpdateList),
    debounceTime(2000),
    switchMap(action => {
      if (action.payload.offline) {
        this.saveToLocalstorage(action.payload, false);
        return of(null);
      }
      return this.listService.set(action.payload.$key, action.payload);
    })
  );

  @Effect({ dispatch: false })
  atomicListUpdate = this.actions$.pipe(
    ofType<UpdateListAtomic>(ListsActionTypes.UpdateListAtomic),
    switchMap((action) => {
      if (action.payload.offline) {
        this.saveToLocalstorage(action.payload, false);
        return of(null);
      }
      return this.listService.update(action.payload.$key, action.payload);
    })
  );

  @Effect()
  convertListsAfterRegister$ = this.actions$.pipe(
    ofType<ConvertLists>(ListsActionTypes.ConvertLists),
    withLatestFrom(this.listsFacade.myLists$),
    switchMap(([action, lists]) => {
      return from(
        lists.map(list => {
          list.authorId = action.uid;
          return new UpdateList(list, true);
        })
      );
    })
  );

  @Effect({ dispatch: false })
  deleteListFromDatabase$ = this.actions$.pipe(
    ofType<DeleteList>(ListsActionTypes.DeleteList),
    withLatestFrom(this.listsFacade.pinnedList$),
    mergeMap(([action, pin]) => {
      if (pin === action.key) {
        this.listsFacade.unpin();
      }
      if (action.offline) {
        this.removeFromLocalStorage(action.key);
        return EMPTY;
      }
      return this.listService.remove(action.key);
    })
  );

  @Effect()
  updateItemDone$ = this.actions$.pipe(
    ofType<SetItemDone>(ListsActionTypes.SetItemDone),
    withLatestFrom(this.listsFacade.selectedList$,
      this.teamsFacade.selectedTeam$,
      this.authFacade.userId$,
      this.authFacade.fcId$,
      this.listsFacade.autocompleteEnabled$,
      this.listsFacade.completionNotificationEnabled$),
    filter(([action, list, , , , autofillEnabled, completionNotificationEnabled]) => {
      const item = list.getItemById(action.itemId, !action.finalItem, action.finalItem);
      if (autofillEnabled && this.settings.enableAutofillHQFilter && (list as List).requiredAsHQ(item) > 0) {
        return !action.fromPacket || action.hq;
      }
      return true;
    }),
    map(([action, list, team, userId, fcId, autofillEnabled, completionNotificationEnabled]) => {
      const item = list.getItemById(action.itemId, !action.finalItem, action.finalItem);
      const historyEntry = list.modificationsHistory.find(entry => {
        return entry.itemId === action.itemId && (Date.now() - entry.date < 600000);
      });
      if (historyEntry !== undefined) {
        historyEntry.amount += action.doneDelta;
      } else {
        list.modificationsHistory.push({
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
          const notificationTitle = this.translate.instant('LIST_DETAILS.Autofill_notification_title');
          const notificationBody = this.translate.instant('LIST_DETAILS.Autofill_notification_body', {
            itemName: this.i18n.getName(this.l12n.getItem(action.itemId)),
            listName: list.name
          });
          const notificationIcon = `https://xivapi.com${this.lazyData.data.itemIcons[action.itemId]}`;
          const audio = new Audio(`./assets/audio/${this.settings.autofillCompletionSound}.mp3`);
          audio.loop = false;
          audio.volume = this.settings.autofillCompletionVolume;
          audio.play();
          if (this.platform.isDesktop()) {
            this.ipc.send('notification', {
              title: notificationTitle,
              content: notificationBody,
              icon: notificationIcon
            });
          }
          this.notificationService.info(notificationTitle, notificationBody);
        }
      }
      return [action, list];
    }),
    map(([action, list]: [SetItemDone, List]) => {
      list.setDone(action.itemId, action.doneDelta, !action.finalItem, action.finalItem, false, action.recipeId, action.external);
      list.updateAllStatuses(action.itemId);
      if (this.settings.autoMarkAsCompleted && action.doneDelta > 0) {
        if (action.recipeId) {
          this.markAsDoneInDoHLog(+(action.recipeId));
        } else {
          this.markAsDoneInDoLLog(action.itemId);
        }
      }
      return new UpdateListAtomic(list);
    })
  );

  @Effect()
  deleteEphemeralListsOnComplete$ = this.actions$.pipe(
    ofType<UpdateList>(ListsActionTypes.UpdateList, ListsActionTypes.UpdateListAtomic),
    filter(action => action.payload.ephemeral && action.payload.isComplete()),
    map(action => new DeleteList(action.payload.$key, action.payload.offline)),
    delay(500),
    tap(() => this.router.navigate(['/lists']))
  );

  @Effect()
  updateItem$ = this.actions$.pipe(
    ofType<UpdateItem>(ListsActionTypes.UpdateItem),
    withLatestFrom(this.listsFacade.selectedList$),
    map(([action, list]) => {
      const items = action.finalItem ? list.finalItems : list.items;
      const updatedItems = items.map(item => item.id === action.item.id ? action.item : item);
      if (action.finalItem) {
        list.finalItems = updatedItems;
      } else {
        list.items = updatedItems;
      }
      return list;
    }),
    map(list => new UpdateList(list))
  );

  @Effect()
  openCompletionPopup$ = this.actions$.pipe(
    ofType<SetItemDone>(ListsActionTypes.SetItemDone),
    withLatestFrom(this.listsFacade.selectedList$, this.authFacade.userId$),
    filter(([action, list, userId]) => {
      return !list.ephemeral && list.authorId === userId && list.isComplete();
    }),
    tap(([, list]) => {
      this.dialog.create({
        nzTitle: this.translate.instant('LIST.COMPLETION_POPUP.Title'),
        nzFooter: null,
        nzContent: ListCompletionPopupComponent,
        nzComponentParams: {
          list: list
        }
      });
    }),
    switchMap(() => EMPTY)
  );

  private localStore: List[] = [];

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
    private pushNotificationsService: PushNotificationsService,
    private notificationService: NzNotificationService,
    private platform: PlatformService,
    private ipc: IpcService,
    private settings: SettingsService,
    private i18n: I18nToolsService,
    private l12n: LocalizedDataService,
    private lazyData: LazyDataService
  ) {
  }

  private markAsDoneInDoHLog(recipeId: number): void {
    this.authFacade.user$.pipe(first()).subscribe(user => {
      user.logProgression.push(recipeId);
      this.authFacade.updateUser(user);
    });
  }

  private markAsDoneInDoLLog(itemId: number): void {
    this.authFacade.user$.pipe(first()).subscribe(user => {
      user.gatheringLogProgression.push(itemId);
      this.authFacade.updateUser(user);
    });
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
