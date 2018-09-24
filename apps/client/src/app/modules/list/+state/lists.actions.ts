import { Action } from '@ngrx/store';
import { List } from '../model/list';

export enum ListsActionTypes {
  LoadMyLists = '[Lists] Load My Lists',

  LoadList = '[Lists] Load List',
  SelectList = '[Lists] Select List',

  SetItemDone = '[Lists] Set Item Done',

  ListsLoaded = '[Lists] Lists Loaded',
  CreateList = '[Lists] Create List',
  UpdateList = '[Lists] Update List',
  DeleteList = '[Lists] Delete List',
}

export enum ListsType {
  MY_LISTS,
  SINGLE_LIST,
  COMMUNITY_LISTS,
  PROFILE_LISTS
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

export class SetItemDone implements Action {
  readonly type = ListsActionTypes.SetItemDone;

  constructor(public readonly itemId: number, public readonly finalItem: boolean, public readonly doneDelta: number) {
  }
}

export class ListsLoaded implements Action {
  readonly type = ListsActionTypes.ListsLoaded;

  constructor(public payload: List[], public readonly listsType: ListsType) {
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

export type ListsAction = LoadMyLists | ListsLoaded | CreateList | UpdateList | DeleteList | LoadList | SelectList | SetItemDone;

export const fromListsActions = {
  LoadMyLists,
  ListsLoaded,
  CreateList,
  UpdateList,
  DeleteList,
  LoadList,
  SelectList,
  SetItemDone
};
