import { Action } from '@ngrx/store';
import { List } from '../model/list';
import { ListRow } from '../model/list-row';

export enum ListsActionTypes {
  LoadMyLists = '[Lists] Load My Lists',

  LoadListsWithWriteAccess = '[Lists] Load Lists With Write Access',

  ListsForTeamsLoaded = '[Lists] Lists For Team Loaded',

  LoadListDetails = '[Lists] Load List',
  LoadListCompact = '[Lists] Load List Compact',
  SelectList = '[Lists] Select List',

  SetItemDone = '[Lists] Set Item Done',
  UpdateItem = '[Lists] Update Item',

  MyListsLoaded = '[Lists] My Lists Loaded',
  ListCompactLoaded = '[Lists] List Compact Loaded',
  ListsWithWriteAccessLoaded = '[Lists] Lists With Write Access Loaded',
  ListDetailsLoaded = '[Lists] List Details Loaded',


  CreateList = '[Lists] Create List',
  CreateOptimisticListCompact = '[Lists] Create List Compact',
  UpdateList = '[Lists] Update List',
  UpdateListIndex = '[Lists] Update List Index',
  DeleteList = '[Lists] Delete List',

  NeedsVerification = '[Lists] Needs character verification'
}

export class LoadMyLists implements Action {
  readonly type = ListsActionTypes.LoadMyLists;
}

export class NeedsVerification implements Action {
  readonly type = ListsActionTypes.NeedsVerification;

  constructor(public readonly verificationNeeded: boolean) {
  }
}

export class LoadListsWithWriteAccess implements Action {
  readonly type = ListsActionTypes.LoadListsWithWriteAccess;
}

export class LoadListDetails implements Action {
  readonly type = ListsActionTypes.LoadListDetails;

  constructor(public readonly key: string) {
  }
}

export class LoadListCompact implements Action {
  readonly type = ListsActionTypes.LoadListCompact;

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

  constructor(public readonly itemId: number, public readonly itemIcon: number,
              public readonly finalItem: boolean, public readonly doneDelta: number,
              public readonly recipeId: string) {
  }
}

export class UpdateItem implements Action {
  readonly type = ListsActionTypes.UpdateItem;

  constructor(public readonly item: ListRow, public readonly finalItem: boolean) {
  }
}

export class MyListsLoaded implements Action {
  readonly type = ListsActionTypes.MyListsLoaded;

  constructor(public payload: List[], public readonly userId: string) {
  }
}

export class ListsWithWriteAccessLoaded implements Action {
  readonly type = ListsActionTypes.ListsWithWriteAccessLoaded;

  constructor(public payload: List[]) {
  }
}

export class ListsForTeamsLoaded implements Action {
  readonly type = ListsActionTypes.ListsForTeamsLoaded;

  constructor(public payload: List[]) {
  }
}

export class ListDetailsLoaded implements Action {
  readonly type = ListsActionTypes.ListDetailsLoaded;

  constructor(public payload: Partial<List>) {
  }
}

export class ListCompactLoaded implements Action {
  readonly type = ListsActionTypes.ListCompactLoaded;

  constructor(public payload: Partial<List>) {
  }
}

export class CreateList implements Action {
  readonly type = ListsActionTypes.CreateList;

  constructor(public readonly payload: List) {
  }
}

export class CreateOptimisticListCompact implements Action {
  readonly type = ListsActionTypes.CreateOptimisticListCompact;

  constructor(public readonly payload: List, public readonly key: string) {
  }
}

export class UpdateList implements Action {
  readonly type = ListsActionTypes.UpdateList;

  constructor(public readonly payload: List, public readonly updateCompact = false) {
  }
}

export class UpdateListIndex implements Action {
  readonly type = ListsActionTypes.UpdateListIndex;

  constructor(public readonly payload: List) {
  }
}

export class DeleteList implements Action {
  readonly type = ListsActionTypes.DeleteList;

  constructor(public readonly key: string) {
  }
}

export type ListsAction =
  LoadMyLists
  | MyListsLoaded
  | CreateList
  | UpdateList
  | DeleteList
  | LoadListDetails
  | SelectList
  | SetItemDone
  | ListDetailsLoaded
  | CreateOptimisticListCompact
  | UpdateListIndex
  | LoadListCompact
  | ListCompactLoaded
  | LoadListsWithWriteAccess
  | ListsWithWriteAccessLoaded
  | UpdateItem
  | ListsForTeamsLoaded
  | NeedsVerification;
