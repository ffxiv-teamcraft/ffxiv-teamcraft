import { Injectable } from '@angular/core';

import { select, Store } from '@ngrx/store';

import { RotationFoldersPartialState } from './rotation-folders.reducer';
import { rotationFoldersQuery } from './rotation-folders.selectors';
import {
  CreateRotationFolder,
  DeleteRotationFolder,
  LoadMyRotationFolders,
  LoadRotationFolder,
  RemoveRotationFromFolder,
  SelectRotationFolder,
  UpdateRotationFolder
} from './rotation-folders.actions';
import { AuthFacade } from '../../../+state/auth.facade';
import { combineLatest, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { CraftingRotationsFolder } from '../../../model/other/crafting-rotations-folder';
import { CraftingRotation } from '../../../model/other/crafting-rotation';
import { RotationsFacade } from '../../rotations/+state/rotations.facade';

@Injectable()
export class RotationFoldersFacade {
  loaded$ = this.store.pipe(select(rotationFoldersQuery.getLoaded));

  allRotationFolders$ = this.store.pipe(
    select(rotationFoldersQuery.getAllRotationFolders)
  );

  selectedRotationFolder$ = this.store.pipe(
    select(rotationFoldersQuery.getSelectedRotationFolder),
    filter(rotation => rotation !== undefined)
  );

  myRotationFolders$ = combineLatest([this.allRotationFolders$, this.authFacade.userId$]).pipe(
    map(([folders, userId]) => folders.filter(folder => folder.authorId === userId)
      .sort((a, b) => a.index - b.index))
  );

  favoriteRotationFolders$: Observable<{ folder: CraftingRotationsFolder, rotations: CraftingRotation[] }[]> =
    combineLatest([this.allRotationFolders$, this.authFacade.favorites$, this.rotationsFacade.allRotations$]).pipe(
      map(([folders, favorites, rotations]) => {
        (favorites.rotationFolders || []).forEach(folder => {
          if (folders.find(f => f.$key === folder) === undefined) {
            this.store.dispatch(new LoadRotationFolder(folder));
          }
        });
        return (favorites.rotationFolders || [])
          .map(folderId => folders.find(folder => folder.$key === folderId))
          .filter(f => f !== undefined && !f.notFound)
          .map(folder => {
            return {
              folder: folder,
              rotations: folder.rotationIds.map(rotationId => rotations.find(r => r.$key === rotationId))
            };
          });
      })
    );

  constructor(private store: Store<RotationFoldersPartialState>,
              private rotationsFacade: RotationsFacade,
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

  removeRotationFromFolder(rotationKey: string, folderKey: string): void {
    this.store.dispatch(new RemoveRotationFromFolder(rotationKey, folderKey));
  }

  loadFolder(key: string): void {
    this.store.dispatch(new LoadRotationFolder(key));
  }

  select(key: string): void {
    this.store.dispatch(new SelectRotationFolder(key));
  }

  loadMyRotationFolders() {
    this.store.dispatch(new LoadMyRotationFolders());
  }
}
