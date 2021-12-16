import { Action } from '@ngrx/store';
import { CustomItem } from '../model/custom-item';
import { CustomItemFolder } from '../model/custom-item-folder';

export enum CustomItemsActionTypes {
  LoadCustomItems = '[CustomItems] Load CustomItems',
  CustomItemsLoaded = '[CustomItems] CustomItems Loaded',

  CreateCustomItem = '[CustomItems] Create CustomItem',
  UpdateCustomItem = '[CustomItems] Update CustomItem',
  DeleteCustomItem = '[CustomItems] Delete CustomItem',

  LoadCustomItemFolders = '[CustomItems] Load CustomItem Folders',
  CustomItemFoldersLoaded = '[CustomItems] CustomItem Folders Loaded',

  CreateCustomItemFolder = '[CustomItems] Create CustomItem Folder',
  UpdateCustomItemFolder = '[CustomItems] Update CustomItem Folder',
  DeleteCustomItemFolder = '[CustomItems] Delete CustomItem Folder',
}

export class LoadCustomItems implements Action {
  readonly type = CustomItemsActionTypes.LoadCustomItems;
}

export class CustomItemsLoaded implements Action {
  readonly type = CustomItemsActionTypes.CustomItemsLoaded;

  constructor(public payload: CustomItem[]) {
  }
}

export class CreateCustomItem implements Action {
  readonly type = CustomItemsActionTypes.CreateCustomItem;

  constructor(public payload: CustomItem) {
  }
}

export class UpdateCustomItem implements Action {
  readonly type = CustomItemsActionTypes.UpdateCustomItem;

  constructor(public payload: CustomItem) {
  }
}

export class DeleteCustomItem implements Action {
  readonly type = CustomItemsActionTypes.DeleteCustomItem;

  constructor(public key: string) {
  }
}

export class LoadCustomItemFolders implements Action {
  readonly type = CustomItemsActionTypes.LoadCustomItemFolders;
}

export class CustomItemFoldersLoaded implements Action {
  readonly type = CustomItemsActionTypes.CustomItemFoldersLoaded;

  constructor(public payload: CustomItemFolder[]) {
  }
}

export class CreateCustomItemFolder implements Action {
  readonly type = CustomItemsActionTypes.CreateCustomItemFolder;

  constructor(public payload: CustomItemFolder) {
  }
}

export class UpdateCustomItemFolder implements Action {
  readonly type = CustomItemsActionTypes.UpdateCustomItemFolder;

  constructor(public payload: CustomItemFolder) {
  }
}

export class DeleteCustomItemFolder implements Action {
  readonly type = CustomItemsActionTypes.DeleteCustomItemFolder;

  constructor(public key: string) {
  }
}

export type CustomItemsAction =
  | LoadCustomItems
  | CustomItemsLoaded
  | CreateCustomItem
  | UpdateCustomItem
  | DeleteCustomItem
  | LoadCustomItemFolders
  | CustomItemFoldersLoaded
  | CreateCustomItemFolder
  | UpdateCustomItemFolder
  | DeleteCustomItemFolder;
