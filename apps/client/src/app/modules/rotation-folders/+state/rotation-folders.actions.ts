import { Action } from '@ngrx/store';
import { CraftingRotationsFolder } from '../../../model/other/crafting-rotations-folder';

export enum RotationFoldersActionTypes {
  LoadMyRotationFolders = '[RotationFolders] Load My RotationFolders',
  MyRotationFoldersLoaded = '[RotationFolders] My RotationFolders Loaded',

  SelectRotationFolder = '[RotationFolders] Select Rotation Folder',
  LoadRotationFolder = '[RotationFolders] Load Rotation Folder',
  RotationFolderLoaded = '[RotationFolders] Rotation Folder Loaded',
  UpdateRotationFolder = '[RotationFolders] UpdateRotation Folder',
  CreateRotationFolder = '[RotationFolders] Create Rotation Folder',
  DeleteRotationFolder = '[RotationFolders] DeleteRotation Folder',
}

export class LoadMyRotationFolders implements Action {
  readonly type = RotationFoldersActionTypes.LoadMyRotationFolders;
}

export class MyRotationFoldersLoaded implements Action {
  readonly type = RotationFoldersActionTypes.MyRotationFoldersLoaded;

  constructor(public payload: CraftingRotationsFolder[], public userId: string) {
  }
}

export class SelectRotationFolder implements Action {
  readonly type = RotationFoldersActionTypes.SelectRotationFolder;

  constructor(public key: string) {
  }
}

export class LoadRotationFolder implements Action {
  readonly type = RotationFoldersActionTypes.LoadRotationFolder;

  constructor(public key: string) {
  }
}

export class UpdateRotationFolder implements Action {
  readonly type = RotationFoldersActionTypes.UpdateRotationFolder;

  constructor(public folder: CraftingRotationsFolder) {
  }
}

export class RotationFolderLoaded implements Action {
  readonly type = RotationFoldersActionTypes.RotationFolderLoaded;

  constructor(public folder: CraftingRotationsFolder) {
  }
}

export class CreateRotationFolder implements Action {
  readonly type = RotationFoldersActionTypes.CreateRotationFolder;

  constructor(public folder: CraftingRotationsFolder) {
  }
}

export class DeleteRotationFolder implements Action {
  readonly type = RotationFoldersActionTypes.DeleteRotationFolder;

  constructor(public key: string) {
  }
}


export type RotationFoldersAction =
  | LoadMyRotationFolders
  | RotationFolderLoaded
  | MyRotationFoldersLoaded
  | SelectRotationFolder
  | LoadRotationFolder
  | UpdateRotationFolder
  | CreateRotationFolder
  | DeleteRotationFolder;

