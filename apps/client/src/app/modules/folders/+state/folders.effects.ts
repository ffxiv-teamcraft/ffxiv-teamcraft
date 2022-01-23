import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { AuthFacade } from '../../../+state/auth.facade';
import {
  CreateFolder,
  DeleteFolder,
  FolderLoaded,
  FoldersActionTypes,
  FoldersLoaded,
  LoadFolder,
  LoadFolders,
  PureUpdateFolder,
  UpdateFolder,
  UpdateFolderIndexes
} from './folders.actions';
import { catchError, distinctUntilChanged, exhaustMap, filter, first, map, mergeMap, switchMap, switchMapTo } from 'rxjs/operators';
import { TeamcraftUser } from '../../../model/user/teamcraft-user';
import { FoldersService } from '../../../core/database/folders.service';
import { EMPTY, of } from 'rxjs';
import { Folder } from '../../../model/folder/folder';
import { NameQuestionPopupComponent } from '../../name-question-popup/name-question-popup/name-question-popup.component';
import { NzModalService } from 'ng-zorro-antd/modal';
import { TranslateService } from '@ngx-translate/core';
import { FoldersFacade } from './folders.facade';
import { onlyIfNotConnected } from '../../../core/rxjs/only-if-not-connected';

@Injectable()
export class FoldersEffects {

  
  loadFolders$ = createEffect(() => this.actions$.pipe(
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
  ));

  
  loadFolder$ = createEffect(() => this.actions$.pipe(
    ofType<LoadFolder>(FoldersActionTypes.LoadFolder),
    onlyIfNotConnected(this.foldersFacade.allFolders$, action => action.key),
    mergeMap(action => {
      return this.foldersService.get(action.key)
        .pipe(catchError(() => of({ $key: action.key, content: [], subFolders: [], notFound: true } as Folder<any>)));
    }),
    map(folder => new FolderLoaded(folder))
  ));

  
  updateFolder$ = createEffect(() => this.actions$.pipe(
    ofType<UpdateFolder>(FoldersActionTypes.UpdateFolder),
    switchMap(action => {
      return this.foldersService.update(action.key, action.folder);
    })
  ), {
    dispatch: false
  });

  
  pureUpdateFolder = createEffect(() => this.actions$.pipe(
    ofType<PureUpdateFolder>(FoldersActionTypes.PureUpdateFolder),
    switchMap(action => {
      return this.foldersService.pureUpdate(action.key, action.folder);
    })
  ), {
    dispatch: false
  });

  
  deleteFolder$ = createEffect(() => this.actions$.pipe(
    ofType<DeleteFolder>(FoldersActionTypes.DeleteFolder),
    switchMap(action => {
      return this.foldersService.remove(action.key);
    })
  ), {
    dispatch: false
  });

  
  updateFolderIndexes$ = createEffect(() => this.actions$.pipe(
    ofType<UpdateFolderIndexes>(FoldersActionTypes.UpdateFolderIndexes),
    switchMap(action => {
      return this.foldersService.updateIndexes(action.payload);
    })
  ), {
    dispatch: false
  });


  
  createFolder$ = createEffect(() => this.actions$.pipe(
    ofType<CreateFolder>(FoldersActionTypes.CreateFolder),
    switchMap((action: CreateFolder) => {
      return this.authFacade.userId$.pipe(
        first(),
        switchMap(userId => {
          return this.dialog.create({
            nzContent: NameQuestionPopupComponent,
            nzFooter: null,
            nzTitle: this.translate.instant('FOLDERS.New_folder')
          }).afterClose.pipe(
            filter(name => name),
            map(name => {
              const folder = new Folder<any>(action.contentType);
              folder.name = name;
              folder.authorId = userId;
              return folder;
            })
          );
        }),
        switchMap(folder => {
          return this.foldersService.add(folder);
        })
      );
    }),
    switchMapTo(EMPTY)
  ), {
    dispatch: false
  });

  constructor(private actions$: Actions, private authFacade: AuthFacade,
              private foldersService: FoldersService, private dialog: NzModalService,
              private translate: TranslateService, private foldersFacade: FoldersFacade) {
  }
}
