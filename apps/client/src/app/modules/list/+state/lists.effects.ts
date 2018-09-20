import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { ListService } from '../list.service';
import { CreateList, DeleteList, ListsActionTypes, ListsLoaded, UpdateList } from './lists.actions';
import { map, mergeMap, withLatestFrom } from 'rxjs/operators';
import { AuthFacade } from '../../../+state/auth.facade';
import { TeamcraftUser } from '../../../model/user/teamcraft-user';
import { EMPTY } from 'rxjs';

@Injectable()
export class ListsEffects {

  @Effect()
  loadLists$ = this.actions$.pipe(
    ofType(ListsActionTypes.LoadLists),
    mergeMap(() => this.authFacade.userId$),
    mergeMap((userId) => {
      return this.listService.getByForeignKey(TeamcraftUser, userId);
    }),
    map(lists => new ListsLoaded(lists))
  );

  @Effect()
  createListInDatabase$ = this.actions$.pipe(
    ofType(ListsActionTypes.CreateList),
    withLatestFrom(this.authFacade.userId$),
    map(([action, userId]) => {
      (<CreateList>action).payload.authorId = userId;
      return (<CreateList>action).payload;
    }),
    mergeMap(list => this.listService.add(list)),
    mergeMap(() => EMPTY)
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
    private listService: ListService
  ) {
  }
}
