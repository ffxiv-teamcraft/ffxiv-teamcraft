import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import {
  CreateRotationFolder,
  DeleteRotationFolder,
  LoadRotationFolder,
  MyRotationFoldersLoaded, RemoveRotationFromFolder,
  RotationFolderLoaded,
  RotationFoldersActionTypes,
  UpdateRotationFolder
} from './rotation-folders.actions';
import { AuthFacade } from '../../../+state/auth.facade';
import { map, mergeMap, switchMap, withLatestFrom } from 'rxjs/operators';
import { CraftingRotationsFolderService } from '../../../core/database/crafting-rotations-folder.service';
import { TeamcraftUser } from '../../../model/user/teamcraft-user';
import { EMPTY } from 'rxjs';
import { RemoveListFromWorkshop, UpdateWorkshop, WorkshopsActionTypes } from '../../workshop/+state/workshops.actions';
import { Workshop } from '../../../model/other/workshop';
import { RotationFoldersFacade } from './rotation-folders.facade';
import { CraftingRotationsFolder } from '../../../model/other/crafting-rotations-folder';

@Injectable()
export class RotationFoldersEffects {

  @Effect()
  loadMyRotationFolders$ = this.actions$.pipe(
    ofType(RotationFoldersActionTypes.LoadMyRotationFolders),
    switchMap(() => this.authFacade.userId$),
    switchMap(userId => {
      return this.craftingRotationFolderService.getByForeignKey(TeamcraftUser, userId).pipe(
        map(folders => new MyRotationFoldersLoaded(folders, userId))
      );
    })
  );

  @Effect()
  loadRotationFolder$ = this.actions$.pipe(
    ofType<LoadRotationFolder>(RotationFoldersActionTypes.LoadRotationFolder),
    mergeMap(action => {
      return this.craftingRotationFolderService.get(action.key);
    }),
    map(folder => new RotationFolderLoaded(folder))
  );

  @Effect()
  createRotationFolder$ = this.actions$.pipe(
    ofType<CreateRotationFolder>(RotationFoldersActionTypes.CreateRotationFolder),
    withLatestFrom(this.authFacade.userId$),
    switchMap(([action, userId]) => {
      action.folder.authorId = userId;
      return this.craftingRotationFolderService.add(action.folder);
    }),
    switchMap(() => EMPTY)
  );


  @Effect()
  updateRotationFolder$ = this.actions$.pipe(
    ofType<UpdateRotationFolder>(RotationFoldersActionTypes.UpdateRotationFolder),
    switchMap(action => this.craftingRotationFolderService.update(action.folder.$key, action.folder)),
    switchMap(() => EMPTY)
  );


  @Effect()
  deleteRotationFolder$ = this.actions$.pipe(
    ofType<DeleteRotationFolder>(RotationFoldersActionTypes.DeleteRotationFolder),
    switchMap(action => this.craftingRotationFolderService.remove(action.key)),
    switchMap(() => EMPTY)
  );

  @Effect()
  removeListFromWorkshop$ = this.actions$.pipe(
    ofType<RemoveRotationFromFolder>(RotationFoldersActionTypes.RemoveRotationFromFolder),
    withLatestFrom(this.foldersFacade.allRotationFolders$),
    map(([action, folders]: [RemoveRotationFromFolder, CraftingRotationsFolder[]]) => {
      const folder = folders.find(f => f.$key === action.folderKey);
      folder.rotationIds = folder.rotationIds.filter(id => id !== action.rotationKey);
      return new UpdateRotationFolder(folder);
    })
  );

  constructor(
    private actions$: Actions,
    private authFacade: AuthFacade,
    private foldersFacade: RotationFoldersFacade,
    private craftingRotationFolderService: CraftingRotationsFolderService
  ) {
  }
}
