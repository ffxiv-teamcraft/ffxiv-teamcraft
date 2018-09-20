import { Action } from '@ngrx/store';
import { List } from '../model/list';

export enum ListsActionTypes {
  LoadLists = '[Lists] Load Lists',
  ListsLoaded = '[Lists] Lists Loaded',
  CreateList = '[Lists] Create List',
  UpdateList = '[Lists] Update List',
  DeleteList = '[Lists] Delete List',
}

export class LoadLists implements Action {
  readonly type = ListsActionTypes.LoadLists;
}

export class ListsLoaded implements Action {
  readonly type = ListsActionTypes.ListsLoaded;

  constructor(public payload: List[]) {
  }
}

export class CreateList implements Action {
  readonly type = ListsActionTypes.CreateList;

  constructor(public readonly payload: List) {
  }
}

export class UpdateList implements Action {
  readonly type = ListsActionTypes.UpdateList;

  constructor(public readonly payload: List) {
  }
}

export class DeleteList implements Action {
  readonly type = ListsActionTypes.DeleteList;

  constructor(public readonly key: string) {
  }
}

export type ListsAction = LoadLists | ListsLoaded | CreateList | UpdateList | DeleteList;

export const fromListsActions = {
  LoadLists,
  ListsLoaded,
  CreateList,
  UpdateList,
  DeleteList
};
