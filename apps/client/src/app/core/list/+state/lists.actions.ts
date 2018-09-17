import { Action } from '@ngrx/store';
import { List } from '../model/list';

export enum ListsActionTypes {
  LoadLists = '[Lists] Load Lists',
  ListsLoaded = '[Lists] Lists Loaded',
  ListsLoadError = '[Lists] Lists Load Error'
}

export class LoadLists implements Action {
  readonly type = ListsActionTypes.LoadLists;
}

export class ListsLoadError implements Action {
  readonly type = ListsActionTypes.ListsLoadError;
  constructor(public payload: any) {}
}

export class ListsLoaded implements Action {
  readonly type = ListsActionTypes.ListsLoaded;
  constructor(public payload: List[]) {}
}

export type ListsAction = LoadLists | ListsLoaded | ListsLoadError;

export const fromListsActions = {
  LoadLists,
  ListsLoaded,
  ListsLoadError
};
