import { Injectable } from '@angular/core';

import { select, Store } from '@ngrx/store';

import { FoldersPartialState } from './folders.reducer';
import { foldersQuery } from './folders.selectors';
import { CreateFolder, DeleteFolder, LoadFolders, PureUpdateFolder, SelectFolder, UpdateFolder } from './folders.actions';
import { FolderContentType } from '../../../model/folder/folder-content-type';
import { Observable } from 'rxjs';
import { Folder } from '../../../model/folder/folder';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { SelectGearset } from '../../gearsets/+state/gearsets.actions';

@Injectable()
export class FoldersFacade {
  allFolders$ = this.store.pipe(select(foldersQuery.getAllFolders));

  foldersPerTypeCache: { [index: number]: Observable<Folder<any>[]> };

  selectedFoldersCache: { [index: number]: Observable<Folder<any>> } = {};

  constructor(private store: Store<FoldersPartialState>) {
  }

  getSelectedFolder<T>(type: FolderContentType): Observable<Folder<T>> {
    if (this.selectedFoldersCache[type] === undefined) {
      this.selectedFoldersCache[type] = this.store.pipe(select(foldersQuery.getSelectedFolders(type)));
    }
    return this.selectedFoldersCache[type];
  }

  getFolders<T>(type: FolderContentType): Observable<Folder<T>[]> {
    if (this.foldersPerTypeCache[type] === undefined) {
      this.foldersPerTypeCache[type] = this.allFolders$.pipe(
        map(folders => {
          return folders.filter(f => f.contentType === type);
        }),
        distinctUntilChanged()
      );
    }
    return this.foldersPerTypeCache[type];
  }

  loadFolders(type: FolderContentType) {
    this.store.dispatch(new LoadFolders(type));
  }

  createFolder(folder: Folder<any>): void {
    this.store.dispatch(new CreateFolder(folder));
  }

  updateFolder(folder: Folder<any>): void {
    this.store.dispatch(new UpdateFolder(folder.$key, folder));
  }

  pureUpdateFolder(folder: Folder<any>): void {
    this.store.dispatch(new PureUpdateFolder(folder.$key, folder));
  }

  deleteFolder(folder: Folder<any>): void {
    this.store.dispatch(new DeleteFolder(folder.$key));
  }

  select(type: FolderContentType, key: string): void {
    this.store.dispatch(new SelectFolder(type, key));
  }
}
