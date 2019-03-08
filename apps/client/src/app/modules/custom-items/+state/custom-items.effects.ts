import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import {
  CreateCustomItem,
  CreateCustomItemFolder,
  CustomItemFoldersLoaded,
  CustomItemsActionTypes,
  CustomItemsLoaded,
  DeleteCustomItem,
  DeleteCustomItemFolder,
  UpdateCustomItem,
  UpdateCustomItemFolder
} from './custom-items.actions';
import { TeamcraftUser } from '../../../model/user/teamcraft-user';
import { CustomItemsService } from '../custom-items.service';
import { distinctUntilChanged, map, switchMap, withLatestFrom } from 'rxjs/operators';
import { AuthFacade } from '../../../+state/auth.facade';
import { CustomItemFoldersService } from '../custom-item-folders.service';

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
      if (action.payload.$key === undefined) {
        return this.customItemsService.add(action.payload);
      } else {
        return this.customItemsService.set(action.payload.$key, action.payload).pipe(map(() => action.payload.$key));
      }
    })
  );


  @Effect({ dispatch: false })
  updateCustomItem$ = this.actions$.pipe(
    ofType<UpdateCustomItem>(CustomItemsActionTypes.UpdateCustomItem),
    switchMap(action => {
      delete action.payload.folderId;
      delete action.payload.dirty;
      return this.customItemsService.update(action.payload.$key, action.payload);
    })
  );


  @Effect({ dispatch: false })
  deleteCustomItem$ = this.actions$.pipe(
    ofType<DeleteCustomItem>(CustomItemsActionTypes.DeleteCustomItem),
    switchMap(action => this.customItemsService.remove(action.key))
  );

  @Effect()
  loadCustomItemFolders$ = this.actions$.pipe(
    ofType(CustomItemsActionTypes.LoadCustomItemFolders),
    switchMap(() => this.authFacade.userId$),
    distinctUntilChanged(),
    switchMap((userId) => {
      return this.customItemFoldersService.getByForeignKey(TeamcraftUser, userId)
        .pipe(
          map(folders => new CustomItemFoldersLoaded(folders))
        );
    })
  );

  @Effect({ dispatch: false })
  createCustomItemFolder$ = this.actions$.pipe(
    ofType<CreateCustomItemFolder>(CustomItemsActionTypes.CreateCustomItemFolder),
    withLatestFrom(this.authFacade.userId$),
    switchMap(([action, userId]) => {
      action.payload.authorId = userId;
      return this.customItemFoldersService.add(action.payload);
    })
  );


  @Effect({ dispatch: false })
  updateCustomItemFolder$ = this.actions$.pipe(
    ofType<UpdateCustomItemFolder>(CustomItemsActionTypes.UpdateCustomItemFolder),
    switchMap(action => this.customItemFoldersService.update(action.payload.$key, action.payload))
  );


  @Effect({ dispatch: false })
  deleteCustomItemFolder$ = this.actions$.pipe(
    ofType<DeleteCustomItemFolder>(CustomItemsActionTypes.DeleteCustomItemFolder),
    switchMap(action => this.customItemFoldersService.remove(action.key))
  );

  constructor(
    private actions$: Actions,
    private customItemsService: CustomItemsService,
    private customItemFoldersService: CustomItemFoldersService,
    private authFacade: AuthFacade
  ) {
  }
}
