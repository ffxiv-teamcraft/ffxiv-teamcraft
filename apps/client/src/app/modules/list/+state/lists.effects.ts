import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { ListService } from '../list.service';
import {
  CommunityListsLoaded,
  CreateList,
  CreateOptimisticListCompact,
  DeleteList,
  ListCompactLoaded,
  ListDetailsLoaded,
  ListsActionTypes,
  ListsForTeamsLoaded,
  ListsWithWriteAccessLoaded,
  LoadCommunityLists,
  LoadListCompact,
  LoadListDetails,
  MyListsLoaded,
  SetItemDone,
  UpdateItem,
  UpdateList,
  UpdateListIndex
} from './lists.actions';
import { catchError, debounceTime, distinctUntilChanged, filter, first, map, switchMap, withLatestFrom } from 'rxjs/operators';
import { AuthFacade } from '../../../+state/auth.facade';
import { TeamcraftUser } from '../../../model/user/teamcraft-user';
import { combineLatest, concat, EMPTY, of } from 'rxjs';
import { ListsFacade } from './lists.facade';
import { ListCompactsService } from '../list-compacts.service';
import { List } from '../model/list';
import { PermissionLevel } from '../../../core/database/permissions/permission-level.enum';
import { Team } from '../../../model/team/team';
import { TeamsFacade } from '../../teams/+state/teams.facade';
import { DiscordWebhookService } from '../../../core/discord/discord-webhook.service';

@Injectable()
export class ListsEffects {

  @Effect()
  loadMyLists$ = this.actions$.pipe(
    ofType(ListsActionTypes.LoadMyLists),
    first(),
    switchMap(() => this.authFacade.userId$),
    distinctUntilChanged(),
    switchMap((userId) => {
      return this.listCompactsService.getByForeignKey(TeamcraftUser, userId)
        .pipe(
          map(lists => new MyListsLoaded(lists, userId))
        );
    })
  );

  @Effect()
  loadListsWithWriteAccess$ = this.actions$.pipe(
    ofType(ListsActionTypes.LoadListsWithWriteAccess),
    first(),
    switchMap(() => combineLatest(this.authFacade.user$, this.authFacade.fcId$)),
    distinctUntilChanged(),
    switchMap(([user, fcId]) => {
      // First of all, load using user Id
      return this.listCompactsService.getWithWriteAccess(user.$key).pipe(
        switchMap((lists) => {
          // If we don't have fc informations yet, return the lists directly.
          if (!fcId) {
            return of(lists);
          }
          // Else add fc lists
          return this.listCompactsService.getWithWriteAccess(fcId).pipe(
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
    map(lists => new ListsWithWriteAccessLoaded(lists))
  );

  @Effect()
  loadListsForTeam$ = this.teamsFacade.myTeams$.pipe(
    switchMap((teams) => {
      return combineLatest(teams.map(team => this.listCompactsService.getByForeignKey(Team, team.$key)));
    }),
    map(listsArrays => [].concat.apply([], ...listsArrays)),
    map(lists => new ListsForTeamsLoaded(lists))
  );

  @Effect()
  loadListDetails$ = this.actions$.pipe(
    ofType<LoadListDetails>(ListsActionTypes.LoadListDetails),
    withLatestFrom(this.listsFacade.allListDetails$),
    filter(([action, allLists]) => allLists.find(list => list.$key === action.key) === undefined),
    map(([action]) => action),
    switchMap((action: LoadListDetails) => {
      return this.authFacade.loggedIn$.pipe(
        switchMap(loggedIn => {
          return combineLatest(
            of(action.key),
            this.authFacade.user$,
            loggedIn ? this.authFacade.mainCharacter$.pipe(map(c => c.FreeCompanyId)) : of(null),
            this.listService.get(action.key).pipe(catchError(() => of(null)))
          );
        })
      );
    }),
    map(([listKey, user, fcId, list]: [string, TeamcraftUser, string | null, List]) => {
      const userId = user.$key;
      const idEntry = user.lodestoneIds.find(l => l.id === user.defaultLodestoneId);
      const verified = idEntry && idEntry.verified;
      if (!verified) {
        fcId = null;
      }
      if (list !== null) {
        const permissionLevel = Math.max(list.getPermissionLevel(userId), list.getPermissionLevel(fcId));
        if (permissionLevel >= PermissionLevel.READ) {
          return [listKey, list];
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
    ofType(ListsActionTypes.UpdateListIndex),
    map(action => action as UpdateListIndex),
    switchMap(action => concat(
      this.listCompactsService.update(action.payload.$key, { index: action.payload.index }),
      this.listService.update(action.payload.$key, { index: action.payload.index })
    )),
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
    switchMap(list => this.listService.add(list)
      .pipe(
        map((key) => new CreateOptimisticListCompact(list, key)))
    )
  );

  @Effect()
  updateListInDatabase$ = this.actions$.pipe(
    ofType(ListsActionTypes.UpdateList),
    debounceTime(100),
    map(action => action as UpdateList),
    switchMap(action => this.listService.update(action.payload.$key, action.payload)),
    switchMap(() => EMPTY)
  );

  @Effect()
  deleteListFromDatabase$ = this.actions$.pipe(
    ofType(ListsActionTypes.DeleteList),
    map(action => action as DeleteList),
    switchMap(action => this.listService.remove(action.key)),
    switchMap(() => EMPTY)
  );

  @Effect()
  updateItemDone$ = this.actions$.pipe(
    ofType<SetItemDone>(ListsActionTypes.SetItemDone),
    withLatestFrom(this.listsFacade.selectedList$, this.teamsFacade.selectedTeam$, this.authFacade.userId$),
    map(([action, list, team, userId]) => {
      list.modificationsHistory.push({
        amount: action.doneDelta,
        date: Date.now(),
        itemId: action.itemId,
        itemIcon: action.itemIcon,
        userId: userId
      });
      if (team && list.teamId === team.$key && action.doneDelta > 0) {
        this.discordWebhookService.notifyItemChecked(team, action.itemIcon, list, userId, action.doneDelta, action.itemId);
      }
      return [action, list];
    }),
    map(([action, list]: [SetItemDone, List]) => {
      list.setDone(action.itemId, action.doneDelta, !action.finalItem);
      return list;
    }),
    map(list => new UpdateList(list))
  );

  @Effect()
  deleteEphemeralListsOnComplete$ = this.actions$.pipe(
    ofType<UpdateList>(ListsActionTypes.UpdateList),
    filter(action => action.payload.ephemeral && action.payload.isComplete()),
    map(action => new DeleteList(action.payload.$key))
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
    switchMap(action => this.listCompactsService.get(action.key)),
    map(listCompact => new ListCompactLoaded(listCompact))
  );

  @Effect()
  loadCommunityLists$ = this.actions$.pipe(
    ofType<LoadCommunityLists>(ListsActionTypes.LoadCommunityLists),
    // Once community lists are loaded, we don't need to load them anymore thanks to firestore
    first(),
    switchMap(() => this.listCompactsService.getCommunityLists()),
    map(lists => new CommunityListsLoaded(lists))
  );

  constructor(
    private actions$: Actions,
    private authFacade: AuthFacade,
    private listService: ListService,
    private listCompactsService: ListCompactsService,
    private listsFacade: ListsFacade,
    private teamsFacade: TeamsFacade,
    private discordWebhookService: DiscordWebhookService
  ) {
  }
}
