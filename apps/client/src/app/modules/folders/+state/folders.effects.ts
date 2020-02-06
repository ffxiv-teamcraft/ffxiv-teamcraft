import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { AuthFacade } from '../../../+state/auth.facade';
import {
  DeleteFolder,
  FolderLoaded,
  FoldersActionTypes,
  FoldersLoaded,
  LoadFolder,
  LoadFolders,
  PureUpdateFolder,
  UpdateFolder
} from './folders.actions';
import { debounceTime, distinctUntilChanged, exhaustMap, map, switchMap } from 'rxjs/operators';
import { TeamcraftUser } from '../../../model/user/teamcraft-user';
import { FoldersService } from '../../../core/database/folders.service';

@Injectable()
export class FoldersEffects {

  @Effect()
  loadFolders$ = this.actions$.pipe(
    ofType<LoadFolders>(FoldersActionTypes.LoadFolders),
    exhaustMap((action) => {
      return this.authFacade.userId$.pipe(
        distinctUntilChanged(),
        switchMap(userId => {
          return this.foldersService.getByForeignKeyAndType(TeamcraftUser, userId, action.contentType);
        })
      );
    }),
    map(sets => new FoldersLoaded(sets))
  );

  @Effect()
  loadFolder$ = this.actions$.pipe(
    ofType<LoadFolder>(FoldersActionTypes.LoadFolder),
    switchMap(action => {
      return this.foldersService.get(action.key);
    }),
    map(folder => new FolderLoaded(folder))
  );

  @Effect({
    dispatch: false
  })
  updateFolder$ = this.actions$.pipe(
    ofType<UpdateFolder>(FoldersActionTypes.UpdateFolder),
    switchMap(action => {
      return this.foldersService.update(action.key, action.folder);
    })
  );

  @Effect({
    dispatch: false
  })
  pureUpdateFolder = this.actions$.pipe(
    ofType<PureUpdateFolder>(FoldersActionTypes.PureUpdateFolder),
    switchMap(action => {
      return this.foldersService.pureUpdate(action.key, action.folder);
    })
  );

  @Effect({
    dispatch: false
  })
  deleteFolder$ = this.actions$.pipe(
    ofType<DeleteFolder>(FoldersActionTypes.DeleteFolder),
    switchMap(action => {
      return this.foldersService.remove(action.key);
    })
  );

  constructor(private actions$: Actions, private authFacade: AuthFacade,
              private foldersService: FoldersService) {
  }
}
