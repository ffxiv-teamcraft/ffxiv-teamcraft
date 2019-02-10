import { Action } from '@ngrx/store';
import { CustomItem } from '../model/custom-item';

export enum CustomItemsActionTypes {
  LoadCustomItems = '[CustomItems] Load CustomItems',
  CustomItemsLoaded = '[CustomItems] CustomItems Loaded',
  CustomItemsLoadError = '[CustomItems] CustomItems Load Error'
}

export class LoadCustomItems implements Action {
  readonly type = CustomItemsActionTypes.LoadCustomItems;
}

export class CustomItemsLoadError implements Action {
  readonly type = CustomItemsActionTypes.CustomItemsLoadError;
  constructor(public payload: any) {}
}

export class CustomItemsLoaded implements Action {
  readonly type = CustomItemsActionTypes.CustomItemsLoaded;
  constructor(public payload: CustomItem[]) {}
}

export type CustomItemsAction =
  | LoadCustomItems
  | CustomItemsLoaded
  | CustomItemsLoadError;
