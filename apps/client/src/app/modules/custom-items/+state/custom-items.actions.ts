import { Action } from '@ngrx/store';
import { CustomItem } from '../model/custom-item';

export enum CustomItemsActionTypes {
  LoadCustomItems = '[CustomItems] Load CustomItems',
  CustomItemsLoaded = '[CustomItems] CustomItems Loaded',

  CreateCustomItem = '[CustomItems] Create CustomItem',
  UpdateCustomItem = '[CustomItems] Update CustomItem',
  DeleteCustomItem = '[CustomItems] Delete CustomItem',
  SelectCustomItem = '[CustomItems] Select CustomItem',
}

export class LoadCustomItems implements Action {
  readonly type = CustomItemsActionTypes.LoadCustomItems;
}

export class CustomItemsLoaded implements Action {
  readonly type = CustomItemsActionTypes.CustomItemsLoaded;
  constructor(public payload: CustomItem[]) {}
}

export class CreateCustomItem implements Action {
  readonly type = CustomItemsActionTypes.CreateCustomItem;
  constructor(public payload: CustomItem) {}
}

export class UpdateCustomItem implements Action {
  readonly type = CustomItemsActionTypes.UpdateCustomItem;
  constructor(public payload: CustomItem) {}
}

export class DeleteCustomItem implements Action {
  readonly type = CustomItemsActionTypes.DeleteCustomItem;
  constructor(public key:string) {}
}

export class SelectCustomItem implements Action {
  readonly type = CustomItemsActionTypes.SelectCustomItem;
  constructor(public key:string) {}
}

export type CustomItemsAction =
  | LoadCustomItems
  | CustomItemsLoaded
  | CreateCustomItem
  | UpdateCustomItem
  | DeleteCustomItem
  | SelectCustomItem;
