import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { ListService } from '../list.service';
import {
  CreateList,
  CreateOptimisticListCompact,
  DeleteList,
  ListDetailsLoaded,
  ListsActionTypes,
  LoadListDetails,
  MyListsLoaded,
  UpdateList,
  UpdateListIndex
} from './lists.actions';
import { distinctUntilChanged, filter, map, mergeMap, withLatestFrom } from 'rxjs/operators';
import { AuthFacade } from '../../../+state/auth.facade';
import { TeamcraftUser } from '../../../model/user/teamcraft-user';
import { combineLatest, concat, EMPTY } from 'rxjs';
import { ListsFacade } from './lists.facade';
import { ListCompactsService } from '../list-compacts.service';

@Injectable()
export class ListsEffects {

  @Effect()
  loadMyLists$ = this.actions$.pipe(
    ofType(ListsActionTypes.LoadMyLists),
    mergeMap(() => this.authFacade.userId$),
    distinctUntilChanged(),
    mergeMap((userId) => {
      return this.listCompactsService.getByForeignKey(TeamcraftUser, userId);
    }),
    map(lists => new MyListsLoaded(lists))
  );

  @Effect()
  loadListDetails$ = this.actions$.pipe(
    ofType(ListsActionTypes.LoadListDetails),
    withLatestFrom(this.listsFacade.allListDetails$),
    filter(([action, allLists]) => allLists.find(list => list.$key === (<LoadListDetails>action).key) === undefined),
    map(([action]) => action),
    mergeMap((action: LoadListDetails) => {
      // TODO handle NotFound error properly
      return combineLatest(this.authFacade.userId$, this.listService.get(action.key));
    }),
    distinctUntilChanged(),
    map(([userId, list]) => {
      // TODO Read permission should be handled here.
      return list;
    }),
    map(list => new ListDetailsLoaded(list))
  );

  @Effect()
  createOptimisticListCompact$ = this.actions$.pipe(
    ofType(ListsActionTypes.CreateOptimisticListCompact),
    withLatestFrom(this.listsFacade.myLists$),
    map(([action, lists]) => {
      (<CreateOptimisticListCompact>action).payload.$key = (<CreateOptimisticListCompact>action).key;
      delete (<CreateOptimisticListCompact>action).payload.items;
      return new MyListsLoaded([...lists, (<CreateOptimisticListCompact>action).payload]);
    })
  );

  @Effect()
  persistUpdateListIndex$ = this.actions$.pipe(
    ofType(ListsActionTypes.UpdateListIndex),
    map(action => action as UpdateListIndex),
    mergeMap(action => concat(
      this.listCompactsService.update(action.payload.$key, { index: action.payload.index }),
      this.listService.update(action.payload.$key, { index: action.payload.index })
    )),
    mergeMap(() => EMPTY)
  );

  @Effect()
  createListInDatabase$ = this.actions$.pipe(
    ofType(ListsActionTypes.CreateList),
    withLatestFrom(this.authFacade.userId$),
    map(([action, userId]) => {
      (<CreateList>action).payload.authorId = userId;
      return (<CreateList>action).payload;
    }),
    mergeMap(list => this.listService.add(list)
      .pipe(
        map((key) => new CreateOptimisticListCompact(list, key)))
    )
  );

  @Effect()
  UpdateListInDatabase$ = this.actions$.pipe(
    ofType(ListsActionTypes.UpdateList),
    map(action => action as UpdateList),
    mergeMap(action => this.listService.update(action.payload.$key, action.payload)),
    mergeMap(() => EMPTY)
  );

  @Effect()
  DeleteListFromDatabase$ = this.actions$.pipe(
    ofType(ListsActionTypes.DeleteList),
    map(action => action as DeleteList),
    mergeMap(action => this.listService.remove(action.key)),
    mergeMap(() => EMPTY)
  );

  constructor(
    private actions$: Actions,
    private authFacade: AuthFacade,
    private listService: ListService,
    private listCompactsService: ListCompactsService,
    private listsFacade: ListsFacade
  ) {
  }
}
