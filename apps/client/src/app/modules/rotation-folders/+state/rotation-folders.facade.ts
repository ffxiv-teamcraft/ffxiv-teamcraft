import { Injectable } from '@angular/core';

import { select, Store } from '@ngrx/store';

import { RotationFoldersPartialState } from './rotation-folders.reducer';
import { rotationFoldersQuery } from './rotation-folders.selectors';
import {
  CreateRotationFolder,
  DeleteRotationFolder,
  LoadMyRotationFolders,
  LoadRotationFolder,
  UpdateRotationFolder
} from './rotation-folders.actions';
import { AuthFacade } from '../../../+state/auth.facade';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { CraftingRotationsFolder } from '../../../model/other/crafting-rotations-folder';

@Injectable()
export class RotationFoldersFacade {
  loaded$ = this.store.pipe(select(rotationFoldersQuery.getLoaded));
  allRotationFolders$ = this.store.pipe(
    select(rotationFoldersQuery.getAllRotationFolders)
  );
  selectedRotationFolder$ = this.store.pipe(
    select(rotationFoldersQuery.getSelectedRotationFolder)
  );
  myRotationFolders$ = combineLatest(this.allRotationFolders$, this.authFacade.userId$).pipe(
    map(([folders, userId]) => folders.filter(folder => folder.authorId === userId))
  );

  constructor(private store: Store<RotationFoldersPartialState>,
              private authFacade: AuthFacade) {
  }

  updateFolder(folder: CraftingRotationsFolder): void {
    this.store.dispatch(new UpdateRotationFolder(folder));
  }

  deleteFolder(key: string): void {
    this.store.dispatch(new DeleteRotationFolder(key));
  }

  createFolder(folder: CraftingRotationsFolder): void {
    this.store.dispatch(new CreateRotationFolder(folder));
  }

  loadFolder(key: string): void {
    this.store.dispatch(new LoadRotationFolder(key));
  }


  loadMyRotationFolders() {
    this.store.dispatch(new LoadMyRotationFolders());
  }
}
