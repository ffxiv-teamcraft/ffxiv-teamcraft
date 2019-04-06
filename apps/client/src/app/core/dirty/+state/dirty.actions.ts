import { Action } from '@ngrx/store';
import { DirtyEntry } from '../dirty-entry';

export enum DirtyActionTypes {
  AddDirty = '[Dirty] Add Dirty',
  RemoveDirty = '[Dirty] Remove Dirty'
}


export class AddDirty implements Action {
  readonly type = DirtyActionTypes.AddDirty;

  constructor(public payload: DirtyEntry) {
  }
}

export class RemoveDirty implements Action {
  readonly type = DirtyActionTypes.RemoveDirty;

  constructor(public payload: DirtyEntry) {
  }
}

export type DirtyAction = AddDirty | RemoveDirty;
