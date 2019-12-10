import { Action } from '@ngrx/store';
import { List } from '../model/list';
import { ListRow } from '../model/list-row';

export enum ListsActionTypes {
  LoadMyLists = '[Lists] Load My Lists',
  LoadTeamLists = '[Lists] Load Team Lists',

  LoadSharedLists = '[Lists] Load Shared Lists',

  ListsForTeamsLoaded = '[Lists] Lists For Team Loaded',

  LoadListDetails = '[Lists] Load List',
  UnloadListDetails = '[Lists] Unload List',
  SelectList = '[Lists] Select List',

  SetItemDone = '[Lists] Set Item Done',
  UpdateItem = '[Lists] Update Item',

  MyListsLoaded = '[Lists] My Lists Loaded',
  TeamListsLoaded = '[Lists] Team Lists Loaded',
  SharedListsLoaded = '[Lists] Shared Lists Loaded',
  ListDetailsLoaded = '[Lists] List Details Loaded',


  CreateList = '[Lists] Create List',
  UpdateList = '[Lists] Update List',
  UpdateListAtomic = '[Lists] Update List Atomic',
  UpdateListIndex = '[Lists] Update List Index',
  DeleteList = '[Lists] Delete List',
  ConvertLists = '[Lists] Convert Lists',
  OfflineListsLoaded = '[Lists] Offline lists loaded',

  NeedsVerification = '[Lists] Needs character verification',
  ToggleAutocompletion = '[Lists] Toggle autocompletion',
  ToggleCompletionNotification = '[Lists] Toggle completion notification',
  PinList = '[Lists] Pin list',
  UnPinList = '[Lists] Unpin list',
}

export class LoadMyLists implements Action {
  readonly type = ListsActionTypes.LoadMyLists;
}

export class LoadTeamLists implements Action {
  readonly type = ListsActionTypes.LoadTeamLists;

  constructor(public readonly teamId: string) {
  }
}

export class TeamListsLoaded implements Action {
  readonly type = ListsActionTypes.TeamListsLoaded;

  constructor(public payload: List[], public readonly teamId: string) {
  }
}

export class NeedsVerification implements Action {
  readonly type = ListsActionTypes.NeedsVerification;

  constructor(public readonly verificationNeeded: boolean) {
  }
}

export class ToggleAutocompletion implements Action {
  readonly type = ListsActionTypes.ToggleAutocompletion;

  constructor(public readonly enabled: boolean) {
  }
}

export class ToggleCompletionNotification implements Action {
  readonly type = ListsActionTypes.ToggleCompletionNotification;

  constructor(public readonly enabled: boolean) {
  }
}

export class LoadSharedLists implements Action {
  readonly type = ListsActionTypes.LoadSharedLists;
}

export class LoadListDetails implements Action {
  readonly type = ListsActionTypes.LoadListDetails;

  constructor(public readonly key: string) {
  }
}

export class SelectList implements Action {
  readonly type = ListsActionTypes.SelectList;

  constructor(public readonly key: string, public readonly autocomplete = false) {
  }
}

export class SetItemDone implements Action {
  readonly type = ListsActionTypes.SetItemDone;

  constructor(public readonly itemId: number, public readonly itemIcon: number,
              public readonly finalItem: boolean, public readonly doneDelta: number,
              public readonly recipeId: string, public readonly totalNeeded: number,
              public readonly external = false, public readonly fromPacket = false,
              public readonly hq = false) {
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

export class OfflineListsLoaded implements Action {
  readonly type = ListsActionTypes.OfflineListsLoaded;

  constructor(public payload: List[]) {
  }
}

export class SharedListsLoaded implements Action {
  readonly type = ListsActionTypes.SharedListsLoaded;

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

export class CreateList implements Action {
  readonly type = ListsActionTypes.CreateList;

  constructor(public readonly payload: List) {
  }
}

export class UpdateList implements Action {
  readonly type = ListsActionTypes.UpdateList;

  constructor(public readonly payload: List, public readonly updateCompact = false, public force = false, public fromPacket = false) {
  }
}

export class UpdateListAtomic implements Action {
  readonly type = ListsActionTypes.UpdateListAtomic;

  constructor(public readonly payload: List) {
  }
}

export class UpdateListIndex implements Action {
  readonly type = ListsActionTypes.UpdateListIndex;

  constructor(public readonly payload: List) {
  }
}

export class DeleteList implements Action {
  readonly type = ListsActionTypes.DeleteList;

  constructor(public readonly key: string, public readonly offline: boolean) {
  }
}

export class ConvertLists implements Action {
  readonly type = ListsActionTypes.ConvertLists;

  constructor(public readonly uid: string) {
  }
}

export class PinList implements Action {
  readonly type = ListsActionTypes.PinList;

  constructor(public readonly uid: string) {
  }
}

export class UnPinList implements Action {
  readonly type = ListsActionTypes.UnPinList;
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
  | UpdateListIndex
  | LoadSharedLists
  | SharedListsLoaded
  | UpdateItem
  | ListsForTeamsLoaded
  | NeedsVerification
  | LoadTeamLists
  | TeamListsLoaded
  | ConvertLists
  | OfflineListsLoaded
  | ToggleAutocompletion
  | ToggleCompletionNotification
  | UpdateListAtomic
  | PinList
  | UnPinList;
