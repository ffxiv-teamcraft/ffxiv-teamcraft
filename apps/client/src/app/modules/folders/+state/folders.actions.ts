import { Action } from '@ngrx/store';
import { Folder } from '../../../model/folder/folder';
import { FolderContentType } from '../../../model/folder/folder-content-type';
import { UpdateData } from '@angular/fire/firestore';

export enum FoldersActionTypes {
  CreateFolder = '[Folders] Create Folder',

  LoadFolders = '[Folders] Load Folders',
  FoldersLoaded = '[Folders] Folders Loaded',

  LoadFolder = '[Folders] Load Folder',
  FolderLoaded = '[Folders] Folder Loaded',

  SelectFolder = '[Folders] Select Folder',
  UpdateFolder = '[Folders] Update Folder',
  UpdateFolderIndexes = '[Folders] Update Folder indexes',
  PureUpdateFolder = '[Folders] Pure Update Folder',
  DeleteFolder = '[Folders] Delete Folder'
}

export class LoadFolders implements Action {
  readonly type = FoldersActionTypes.LoadFolders;

  constructor(public contentType: FolderContentType) {
  }
}

export class FoldersLoaded implements Action {
  readonly type = FoldersActionTypes.FoldersLoaded;

  constructor(public payload: Folder<any>[]) {
  }
}

export class UpdateFolderIndexes implements Action {
  readonly type = FoldersActionTypes.UpdateFolderIndexes;

  constructor(public payload: Folder<any>[]) {
  }
}

export class CreateFolder implements Action {
  readonly type = FoldersActionTypes.CreateFolder;

  constructor(public contentType: FolderContentType) {
  }
}

export class LoadFolder implements Action {
  readonly type = FoldersActionTypes.LoadFolder;

  constructor(public key: string) {
  }
}

export class FolderLoaded implements Action {
  readonly type = FoldersActionTypes.FolderLoaded;

  constructor(public payload: Folder<any>) {
  }
}

export class SelectFolder implements Action {
  readonly type = FoldersActionTypes.SelectFolder;

  constructor(public contentType: FolderContentType, public key: string) {
  }
}

export class UpdateFolder implements Action {
  readonly type = FoldersActionTypes.UpdateFolder;

  constructor(public key: string, public folder: Folder<any>) {
  }
}

export class PureUpdateFolder implements Action {
  readonly type = FoldersActionTypes.PureUpdateFolder;

  constructor(public key: string, public folder: UpdateData<Folder<any>>) {
  }
}

export class DeleteFolder implements Action {
  readonly type = FoldersActionTypes.DeleteFolder;

  constructor(public key: string) {
  }
}

export type FoldersAction =
  LoadFolders
  | FoldersLoaded
  | LoadFolder
  | FolderLoaded
  | SelectFolder
  | UpdateFolder
  | DeleteFolder
  | CreateFolder
  | PureUpdateFolder
  | UpdateFolderIndexes;

