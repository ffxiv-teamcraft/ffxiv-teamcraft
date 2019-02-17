import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import {
  CreateCustomItem,
  CustomItemsActionTypes,
  CustomItemsLoaded,
  DeleteCustomItem,
  UpdateCustomItem
} from './custom-items.actions';
import { TeamcraftUser } from '../../../model/user/teamcraft-user';
import { CustomItemsService } from '../custom-items.service';
import { distinctUntilChanged, map, switchMap, withLatestFrom } from 'rxjs/operators';
import { AuthFacade } from '../../../+state/auth.facade';

@Injectable()
export class CustomItemsEffects {

  @Effect()
  loadCustomItems$ = this.actions$.pipe(
    ofType(CustomItemsActionTypes.LoadCustomItems),
    switchMap(() => this.authFacade.userId$),
    distinctUntilChanged(),
    switchMap((userId) => {
      return this.customItemsService.getByForeignKey(TeamcraftUser, userId)
        .pipe(
          map(items => new CustomItemsLoaded(items))
        );
    })
  );

  @Effect({ dispatch: false })
  createCustomItem$ = this.actions$.pipe(
    ofType<CreateCustomItem>(CustomItemsActionTypes.CreateCustomItem),
    withLatestFrom(this.authFacade.userId$),
    switchMap(([action, userId]) => {
      action.payload.authorId = userId;
      return this.customItemsService.add(action.payload);
    })
  );


  @Effect({ dispatch: false })
  updateCustomItem$ = this.actions$.pipe(
    ofType<UpdateCustomItem>(CustomItemsActionTypes.UpdateCustomItem),
    switchMap(action => this.customItemsService.update(action.payload.$key, action.payload))
  );


  @Effect({ dispatch: false })
  deleteCustomItem$ = this.actions$.pipe(
    ofType<DeleteCustomItem>(CustomItemsActionTypes.DeleteCustomItem),
    switchMap(action => this.customItemsService.remove(action.key))
  );

  constructor(
    private actions$: Actions,
    private customItemsService: CustomItemsService,
    private authFacade: AuthFacade
  ) {
  }
}
