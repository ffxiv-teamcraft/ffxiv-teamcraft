import { Action } from '@ngrx/store';
import { List } from '../model/list';

export enum ListsActionTypes {
  LoadMyLists = '[Lists] Load My Lists',

  LoadListDetails = '[Lists] Load List',
  SelectList = '[Lists] Select List',

  SetItemDone = '[Lists] Set Item Done',

  MyListsLoaded = '[Lists] My Lists Loaded',
  ListDetailsLoaded = '[Lists] List Details Loaded',


  CreateList = '[Lists] Create List',
  UpdateList = '[Lists] Update List',
  DeleteList = '[Lists] Delete List',
}

export class LoadMyLists implements Action {
  readonly type = ListsActionTypes.LoadMyLists;
}

export class LoadListDetails implements Action {
  readonly type = ListsActionTypes.LoadListDetails;

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

export class MyListsLoaded implements Action {
  readonly type = ListsActionTypes.MyListsLoaded;

  constructor(public payload: List[]) {
  }
}

export class ListDetailsLoaded implements Action {
  readonly type = ListsActionTypes.ListDetailsLoaded;

  constructor(public payload: List) {
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

export type ListsAction = LoadMyLists | MyListsLoaded | CreateList | UpdateList | DeleteList | LoadListDetails | SelectList | SetItemDone | ListDetailsLoaded;

export const fromListsActions = {
  LoadMyLists,
  MyListsLoaded,
  CreateList,
  UpdateList,
  DeleteList,
  LoadList: LoadListDetails,
  SelectList,
  SetItemDone
};
