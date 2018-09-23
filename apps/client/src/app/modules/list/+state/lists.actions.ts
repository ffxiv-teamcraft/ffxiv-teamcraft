import { Action } from '@ngrx/store';
import { List } from '../model/list';

export enum ListsActionTypes {
  LoadMyLists = '[Lists] Load My Lists',

  LoadList = '[Lists] Load List',
  SelectList = '[Lists] Select List',

  ListsLoaded = '[Lists] Lists Loaded',
  CreateList = '[Lists] Create List',
  UpdateList = '[Lists] Update List',
  DeleteList = '[Lists] Delete List',
}

export class LoadMyLists implements Action {
  readonly type = ListsActionTypes.LoadMyLists;
}

export class LoadList implements Action {
  readonly type = ListsActionTypes.LoadList;

  constructor(public readonly key: string) {
  }
}

export class SelectList implements Action {
  readonly type = ListsActionTypes.SelectList;

  constructor(public readonly key: string) {
  }
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

export type ListsAction = LoadMyLists | ListsLoaded | CreateList | UpdateList | DeleteList | LoadList | SelectList;

export const fromListsActions = {
  LoadMyLists,
  ListsLoaded,
  CreateList,
  UpdateList,
  DeleteList,
  LoadList,
  SelectList
};
