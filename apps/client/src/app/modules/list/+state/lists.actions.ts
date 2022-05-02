import { Action } from '@ngrx/store';
import { List } from '../model/list';
import { ListRow } from '../model/list-row';

export enum ListsActionTypes {
  LoadMyLists = '[Lists] Load My Lists',
  LoadTeamLists = '[Lists] Load Team Lists',
  LoadArchivedLists = '[Lists] Load Archived Lists',
  UnLoadArchivedLists = '[Lists] Unload Archived Lists',

  LoadSharedLists = '[Lists] Load Shared Lists',

  ListsForTeamsLoaded = '[Lists] Lists For Team Loaded',

  LoadListDetails = '[Lists] Load List',
  UnloadListDetails = '[Lists] Unload List',
  SelectList = '[Lists] Select List',

  SetItemDone = '[Lists] Set Item Done',
  UpdateItem = '[Lists] Update Item',
  MarkItemsHq = '[Lists] Mark items HQ',

  MyListsLoaded = '[Lists] My Lists Loaded',
  ArchivedListsLoaded = '[Lists] Archived Lists Loaded',
  TeamListsLoaded = '[Lists] Team Lists Loaded',
  SharedListsLoaded = '[Lists] Shared Lists Loaded',
  ListDetailsLoaded = '[Lists] List Details Loaded',

  RemoveReadLock = '[Lists] Remove Read Lock',

  CreateList = '[Lists] Create List',
  UpdateList = '[Lists] Update List',
  UpdateListProgress = '[Lists] Update List Progress',
  UpdateSelectedClone = '[Lists] Update Selected Clone',
  PureUpdateList = '[Lists] Pure Update List',
  UpdateListAtomic = '[Lists] Update List Atomic',
  UpdateListIndexes = '[Lists] Update List Indexes',
  DeleteList = '[Lists] Delete List',
  ConvertLists = '[Lists] Convert Lists',
  OfflineListsLoaded = '[Lists] Offline lists loaded',

  ClearModificationsHistory = '[Lists] Clear modifications history',

  NeedsVerification = '[Lists] Needs character verification',
  ToggleAutocompletion = '[Lists] Toggle autocompletion',
  ToggleCompletionNotification = '[Lists] Toggle completion notification',
  PinList = '[Lists] Pin list',
  UnPinList = '[Lists] Unpin list',
  DeleteLists = '[Lists] Delete Lists',
}

export class LoadMyLists implements Action {
  readonly type = ListsActionTypes.LoadMyLists;
}

export class DeleteLists implements Action {
  readonly type = ListsActionTypes.DeleteLists;

  constructor(public readonly keys: string[]) {
  }
}

export class LoadTeamLists implements Action {
  readonly type = ListsActionTypes.LoadTeamLists;

  constructor(public readonly teamId: string) {
  }
}

export class LoadArchivedLists implements Action {
  readonly type = ListsActionTypes.LoadArchivedLists;
}

export class UnLoadArchivedLists implements Action {
  readonly type = ListsActionTypes.UnLoadArchivedLists;
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

export class UnloadListDetails implements Action {
  readonly type = ListsActionTypes.UnloadListDetails;

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
              public readonly recipeId: string, public readonly totalNeeded: number, public readonly settings: { enableAutofillHQFilter: boolean, enableAutofillNQFilter: boolean },
              public readonly external = false, public readonly fromPacket = false,
              public readonly hq = false) {
  }
}

export class UpdateItem implements Action {
  readonly type = ListsActionTypes.UpdateItem;

  constructor(public readonly item: ListRow, public readonly finalItem: boolean) {
  }
}

export class MarkItemsHq implements Action {
  readonly type = ListsActionTypes.MarkItemsHq;

  constructor(public readonly itemIds: number[], public readonly hq: boolean) {
  }
}

export class MyListsLoaded implements Action {
  readonly type = ListsActionTypes.MyListsLoaded;

  constructor(public payload: List[], public readonly userId: string) {
  }
}

export class RemoveReadLock implements Action {
  readonly type = ListsActionTypes.RemoveReadLock;
}

export class ArchivedListsLoaded implements Action {
  readonly type = ListsActionTypes.ArchivedListsLoaded;

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

export class ClearModificationsHistory implements Action {
  readonly type = ListsActionTypes.ClearModificationsHistory;

  constructor(public readonly payload: List) {
  }
}

export class PureUpdateList implements Action {
  readonly type = ListsActionTypes.PureUpdateList;

  constructor(public readonly $key: string, public readonly payload: Partial<List>) {
  }
}

export class UpdateListIndexes implements Action {
  readonly type = ListsActionTypes.UpdateListIndexes;

  constructor(public readonly lists: List[]) {
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
  | UpdateListIndexes
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
  | PinList
  | UnPinList
  | LoadArchivedLists
  | ArchivedListsLoaded
  | UnLoadArchivedLists
  | PureUpdateList
  | MarkItemsHq
  | UnloadListDetails
  | ClearModificationsHistory
  | RemoveReadLock;
