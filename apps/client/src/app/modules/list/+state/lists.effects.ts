import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import {
  ConvertLists,
  CreateList,
  CreateOptimisticListCompact,
  DeleteList,
  ListCompactLoaded,
  ListDetailsLoaded,
  ListsActionTypes,
  ListsForTeamsLoaded,
  LoadListCompact,
  LoadListDetails,
  LoadTeamLists,
  MyListsLoaded,
  SetItemDone,
  SharedListsLoaded,
  TeamListsLoaded,
  UnloadListDetails,
  UpdateItem,
  UpdateList,
  UpdateListAtomic,
  UpdateListIndex
} from './lists.actions';
import {
  catchError,
  delay,
  distinctUntilChanged,
  filter,
  first,
  map,
  mergeMap,
  switchMap,
  takeUntil,
  tap,
  withLatestFrom
} from 'rxjs/operators';
import { AuthFacade } from '../../../+state/auth.facade';
import { TeamcraftUser } from '../../../model/user/teamcraft-user';
import { combineLatest, EMPTY, from, of } from 'rxjs';
import { ListsFacade } from './lists.facade';
import { ListCompactsService } from '../list-compacts.service';
import { List } from '../model/list';
import { PermissionLevel } from '../../../core/database/permissions/permission-level.enum';
import { Team } from '../../../model/team/team';
import { TeamsFacade } from '../../teams/+state/teams.facade';
import { DiscordWebhookService } from '../../../core/discord/discord-webhook.service';
import { Router } from '@angular/router';
import { NzModalService } from 'ng-zorro-antd';
import { ListCompletionPopupComponent } from '../list-completion-popup/list-completion-popup.component';
import { TranslateService } from '@ngx-translate/core';
import { NgSerializerService } from '@kaiu/ng-serializer';
import { ListStore } from '../../../core/database/storage/list/list-store';
import { FirestoreListStorage } from '../../../core/database/storage/list/firestore-list-storage';

@Injectable()
export class ListsEffects {

  @Effect()
  loadMyLists$ = this.actions$.pipe(
    ofType(ListsActionTypes.LoadMyLists),
    switchMap(() => this.authFacade.userId$),
    distinctUntilChanged(),
    switchMap((userId) => {
      this.localStore = this.serializer.deserialize<List>(JSON.parse(localStorage.getItem('offline-lists') || '[]'), [List]);
      this.listsFacade.offlineListsLoaded(this.localStore);
      return this.listCompactsService.getByForeignKey(TeamcraftUser, userId)
        .pipe(
          map(lists => new MyListsLoaded(lists, userId))
        );
    })
  );

  @Effect()
  loadTeamLists$ = this.actions$.pipe(
    ofType<LoadTeamLists>(ListsActionTypes.LoadTeamLists),
    mergeMap((action) => {
      return this.listCompactsService.getByForeignKey(Team, action.teamId)
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
      return this.listCompactsService.getShared(user.$key).pipe(
        switchMap((lists) => {
          // If we don't have fc informations yet, return the lists directly.
          if (!fcId) {
            return of(lists);
          }
          // Else add fc lists
          return this.listCompactsService.getShared(fcId).pipe(
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
      return combineLatest(teams.map(team => this.listCompactsService.getByForeignKey(Team, team.$key)));
    }),
    map(listsArrays => [].concat.apply([], ...listsArrays)),
    map(lists => new ListsForTeamsLoaded(lists))
  );

  unloadListDetails$ = this.actions$.pipe(
    ofType<UnloadListDetails>(ListsActionTypes.UnloadListDetails),
    map(action => action.key)
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
        }),
        takeUntil(this.unloadListDetails$.pipe(
          filter(key => key === action.key)
        ))
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
  createOptimisticListCompact$ = this.actions$.pipe(
    ofType<CreateOptimisticListCompact>(ListsActionTypes.CreateOptimisticListCompact),
    withLatestFrom(this.listsFacade.myLists$),
    map(([action, lists]) => {
      action.payload.$key = action.key;
      delete action.payload.items;
      return new MyListsLoaded([...lists, action.payload], action.payload.authorId);
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
      return combineLatest([
        this.listCompactsService.pureUpdate(action.payload.$key, { index: action.payload.index }),
        this.listService.pureUpdate(action.payload.$key, { index: action.payload.index })
      ]);
    }),
    switchMap(() => EMPTY)
  );

  @Effect()
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
        return this.listService.add(list)
          .pipe(
            map((key) => new CreateOptimisticListCompact(list, key))
          );
      }
    )
  );

  @Effect({ dispatch: false })
  updateListInDatabase$ = this.actions$.pipe(
    ofType<UpdateList>(ListsActionTypes.UpdateList),
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
    ofType<UpdateList>(ListsActionTypes.UpdateListAtomic),
    switchMap((action) => {
      if (action.payload.offline) {
        this.saveToLocalstorage(action.payload, false);
        return of(null);
      }
      return this.listService.update(action.payload.$key, action.payload);
    })
  );

  @Effect({ dispatch: false })
  updateCompactInDatabase$ = this.actions$.pipe(
    ofType<UpdateList>(ListsActionTypes.UpdateList),
    filter(action => action.updateCompact),
    switchMap(action => {
      if (action.payload.offline) {
        return EMPTY;
      }
      if (action.force) {
        return this.listCompactsService.set(action.payload.$key, action.payload.getCompact());
      } else {
        return this.listCompactsService.update(action.payload.$key, action.payload.getCompact());
      }
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
    mergeMap(action => {
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
    withLatestFrom(this.listsFacade.selectedList$, this.teamsFacade.selectedTeam$, this.authFacade.userId$),
    map(([action, list, team, userId]) => {
      const historyEntry = list.modificationsHistory.find(entry => {
        return entry.itemId === action.itemId && (Date.now() - entry.date < 60000);
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
        this.discordWebhookService.notifyItemChecked(team, list, userId, action.doneDelta, action.itemId, action.totalNeeded, action.finalItem);
      }
      return [action, list];
    }),
    map(([action, list]: [SetItemDone, List]) => {
      list.setDone(action.itemId, action.doneDelta, !action.finalItem, action.finalItem, false, action.recipeId, action.external);
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
  loadCompact$ = this.actions$.pipe(
    ofType<LoadListCompact>(ListsActionTypes.LoadListCompact),
    withLatestFrom(this.listsFacade.compacts$),
    filter(([action, compacts]) => compacts.find(list => list.$key === (<LoadListCompact>action).key) === undefined),
    map(([action]) => action),
    mergeMap(action => this.listCompactsService.get(action.key)),
    catchError(() => of({ notFound: true })),
    map(listCompact => new ListCompactLoaded(listCompact))
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
    private listCompactsService: ListCompactsService,
    private listsFacade: ListsFacade,
    private teamsFacade: TeamsFacade,
    private router: Router,
    private dialog: NzModalService,
    private translate: TranslateService,
    private discordWebhookService: DiscordWebhookService,
    private serializer: NgSerializerService
  ) {
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
