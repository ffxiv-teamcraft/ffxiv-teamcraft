import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import {
  CreateRotationFolder,
  DeleteRotationFolder,
  FolderCreated,
  LoadRotationFolder,
  MyRotationFoldersLoaded,
  RemoveRotationFromFolder,
  RotationFolderLoaded,
  RotationFoldersActionTypes,
  UpdateRotationFolder
} from './rotation-folders.actions';
import { AuthFacade } from '../../../+state/auth.facade';
import { catchError, map, mergeMap, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { CraftingRotationsFolderService } from '../../../core/database/crafting-rotations-folder.service';
import { TeamcraftUser } from '../../../model/user/teamcraft-user';
import { EMPTY, of } from 'rxjs';
import { RotationFoldersFacade } from './rotation-folders.facade';
import { CraftingRotationsFolder } from '../../../model/other/crafting-rotations-folder';
import { RotationsFacade } from '../../rotations/+state/rotations.facade';

@Injectable()
export class RotationFoldersEffects {


  loadMyRotationFolders$ = createEffect(() => this.actions$.pipe(
    ofType(RotationFoldersActionTypes.LoadMyRotationFolders),
    switchMap(() => this.authFacade.userId$),
    switchMap(userId => {
      return this.craftingRotationFolderService.getByForeignKey(TeamcraftUser, userId).pipe(
        map(folders => new MyRotationFoldersLoaded(folders, userId))
      );
    })
  ));


  loadRotationFolder$ = createEffect(() => this.actions$.pipe(
    ofType<LoadRotationFolder>(RotationFoldersActionTypes.LoadRotationFolder),
    mergeMap(action => {
      return this.craftingRotationFolderService.get(action.key).pipe(
        catchError(() => {
          return of({ $key: action.key, notFound: true, rotationIds: [] });
        })
      );
    }),
    tap((folder: CraftingRotationsFolder) => {
      return folder.rotationIds.forEach(rotationId => this.rotationsFacade.getRotation(rotationId));
    }),
    map(folder => new RotationFolderLoaded(folder))
  ));


  createRotationFolder$ = createEffect(() => this.actions$.pipe(
    ofType<CreateRotationFolder>(RotationFoldersActionTypes.CreateRotationFolder),
    withLatestFrom(this.authFacade.userId$),
    switchMap(([action, userId]) => {
      action.folder.authorId = userId;
      if (action.folder.originalAuthorId === undefined) {
        action.folder.originalAuthorId = userId;
      }
      return this.craftingRotationFolderService.add(action.folder);
    }),
    map((key: string) => new FolderCreated(key))
  ));


  updateRotationFolder$ = createEffect(() => this.actions$.pipe(
    ofType<UpdateRotationFolder>(RotationFoldersActionTypes.UpdateRotationFolder),
    mergeMap(action => this.craftingRotationFolderService.set(action.folder.$key, action.folder)),
    switchMap(() => EMPTY)
  ), { dispatch: false });


  deleteRotationFolder$ = createEffect(() => this.actions$.pipe(
    ofType<DeleteRotationFolder>(RotationFoldersActionTypes.DeleteRotationFolder),
    mergeMap(action => this.craftingRotationFolderService.remove(action.key)),
    switchMap(() => EMPTY)
  ), { dispatch: false });


  removeListFromWorkshop$ = createEffect(() => this.actions$.pipe(
    ofType<RemoveRotationFromFolder>(RotationFoldersActionTypes.RemoveRotationFromFolder),
    withLatestFrom(this.foldersFacade.allRotationFolders$),
    map(([action, folders]: [RemoveRotationFromFolder, CraftingRotationsFolder[]]) => {
      const folder = folders.find(f => f.$key === action.folderKey);
      folder.rotationIds = folder.rotationIds.filter(id => id !== action.rotationKey);
      return new UpdateRotationFolder(folder);
    })
  ));

  constructor(
    private actions$: Actions,
    private authFacade: AuthFacade,
    private foldersFacade: RotationFoldersFacade,
    private rotationsFacade: RotationsFacade,
    private craftingRotationFolderService: CraftingRotationsFolderService
  ) {
  }
}
