import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
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

  
  loadCustomItems$ = createEffect(() => this.actions$.pipe(
    ofType(CustomItemsActionTypes.LoadCustomItems),
    switchMap(() => this.authFacade.userId$),
    distinctUntilChanged(),
    switchMap((userId) => {
      return this.customItemsService.getByForeignKey(TeamcraftUser, userId)
        .pipe(
          map(items => new CustomItemsLoaded(items))
        );
    })
  ));

  
  createCustomItem$ = createEffect(() => this.actions$.pipe(
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
  ), { dispatch: false });


  
  updateCustomItem$ = createEffect(() => this.actions$.pipe(
    ofType<UpdateCustomItem>(CustomItemsActionTypes.UpdateCustomItem),
    switchMap(action => {
      delete action.payload.folderId;
      delete action.payload.dirty;
      return this.customItemsService.update(action.payload.$key, action.payload);
    })
  ), { dispatch: false });


  
  deleteCustomItem$ = createEffect(() => this.actions$.pipe(
    ofType<DeleteCustomItem>(CustomItemsActionTypes.DeleteCustomItem),
    switchMap(action => this.customItemsService.remove(action.key))
  ), { dispatch: false });

  
  loadCustomItemFolders$ = createEffect(() => this.actions$.pipe(
    ofType(CustomItemsActionTypes.LoadCustomItemFolders),
    switchMap(() => this.authFacade.userId$),
    distinctUntilChanged(),
    switchMap((userId) => {
      return this.customItemFoldersService.getByForeignKey(TeamcraftUser, userId)
        .pipe(
          map(folders => new CustomItemFoldersLoaded(folders))
        );
    })
  ));

  
  createCustomItemFolder$ = createEffect(() => this.actions$.pipe(
    ofType<CreateCustomItemFolder>(CustomItemsActionTypes.CreateCustomItemFolder),
    withLatestFrom(this.authFacade.userId$),
    switchMap(([action, userId]) => {
      action.payload.authorId = userId;
      return this.customItemFoldersService.add(action.payload);
    })
  ), { dispatch: false });


  
  updateCustomItemFolder$ = createEffect(() => this.actions$.pipe(
    ofType<UpdateCustomItemFolder>(CustomItemsActionTypes.UpdateCustomItemFolder),
    switchMap(action => this.customItemFoldersService.update(action.payload.$key, action.payload))
  ), { dispatch: false });


  
  deleteCustomItemFolder$ = createEffect(() => this.actions$.pipe(
    ofType<DeleteCustomItemFolder>(CustomItemsActionTypes.DeleteCustomItemFolder),
    switchMap(action => this.customItemFoldersService.remove(action.key))
  ), { dispatch: false });

  constructor(
    private actions$: Actions,
    private customItemsService: CustomItemsService,
    private customItemFoldersService: CustomItemFoldersService,
    private authFacade: AuthFacade
  ) {
  }
}
