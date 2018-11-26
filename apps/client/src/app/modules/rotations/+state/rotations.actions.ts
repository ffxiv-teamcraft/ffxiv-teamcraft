import { Action } from '@ngrx/store';
import { CraftingRotation } from '../../../model/other/crafting-rotation';

export enum RotationsActionTypes {
  LoadMyRotations = '[Rotations] Load Rotations',
  MyRotationsLoaded = '[Rotations] Rotations Loaded',


  CreateRotation = '[Rotations] Create Rotation',
  UpdateRotation = '[Rotations] Update Rotation',
  RotationPersisted = '[Rotations] Rotation Persisted',
  DeleteRotation = '[Rotations] Delete Rotation',
  GetRotation = '[Rotations] Get Rotation',
  RotationLoaded = '[Rotations] Rotation Loaded',

  SelectRotation = '[Rotations] Select Rotation'
}

export class LoadMyRotations implements Action {
  readonly type = RotationsActionTypes.LoadMyRotations;
}

export class CreateRotation implements Action {
  readonly type = RotationsActionTypes.CreateRotation;

  constructor(public readonly rotation: CraftingRotation) {
  }
}

export class UpdateRotation implements Action {
  readonly type = RotationsActionTypes.UpdateRotation;

  constructor(public readonly rotation: CraftingRotation) {
  }
}

export class DeleteRotation implements Action {
  readonly type = RotationsActionTypes.DeleteRotation;

  constructor(public readonly key: string) {
  }
}

export class RotationPersisted implements Action {
  readonly type = RotationsActionTypes.RotationPersisted;

  constructor(public readonly key: string) {
  }
}

export class SelectRotation implements Action {
  readonly type = RotationsActionTypes.SelectRotation;

  constructor(public readonly key: string) {
  }
}

export class GetRotation implements Action {
  readonly type = RotationsActionTypes.GetRotation;

  constructor(public readonly key: string) {
  }
}

export class RotationLoaded implements Action {
  readonly type = RotationsActionTypes.RotationLoaded;

  constructor(public readonly rotation: Partial<CraftingRotation>) {
  }
}

export class MyRotationsLoaded implements Action {
  readonly type = RotationsActionTypes.MyRotationsLoaded;

  constructor(public payload: CraftingRotation[], public userId: string) {
  }
}

export type RotationsAction =
  | LoadMyRotations
  | MyRotationsLoaded
  | UpdateRotation
  | DeleteRotation
  | CreateRotation
  | SelectRotation
  | RotationPersisted
  | RotationLoaded
  | GetRotation;
