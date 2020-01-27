import { Action } from '@ngrx/store';
import { TeamcraftGearset } from '../../../model/gearset/teamcraft-gearset';

export enum GearsetsActionTypes {
  CreateGearset = '[Gearsets] Create Gearset',
  ImportGearset = '[Gearsets] Import Gearset',

  LoadGearsets = '[Gearsets] Load Gearsets',
  GearsetsLoaded = '[Gearsets] Gearsets Loaded',

  LoadGearset = '[Gearsets] Load Gearset',
  GearsetLoaded = '[Gearsets] Gearset Loaded',

  SelectGearset = '[Gearsets] Select Gearset',
  UpdateGearset = '[Gearsets] Update Gearset',
  DeleteGearset = '[Gearsets] Delete Gearset'
}

export class LoadGearsets implements Action {
  readonly type = GearsetsActionTypes.LoadGearsets;
}

export class GearsetsLoaded implements Action {
  readonly type = GearsetsActionTypes.GearsetsLoaded;

  constructor(public payload: TeamcraftGearset[]) {
  }
}

export class CreateGearset implements Action {
  readonly type = GearsetsActionTypes.CreateGearset;

  constructor(public gearset?: TeamcraftGearset) {
  }
}

export class ImportGearset implements Action {
  readonly type = GearsetsActionTypes.ImportGearset;
}

export class LoadGearset implements Action {
  readonly type = GearsetsActionTypes.LoadGearset;

  constructor(public key: string) {
  }
}

export class GearsetLoaded implements Action {
  readonly type = GearsetsActionTypes.GearsetLoaded;

  constructor(public payload: TeamcraftGearset) {
  }
}

export class SelectGearset implements Action {
  readonly type = GearsetsActionTypes.SelectGearset;

  constructor(public key: string) {
  }
}

export class UpdateGearset implements Action {
  readonly type = GearsetsActionTypes.UpdateGearset;

  constructor(public key: string, public gearset: TeamcraftGearset) {
  }
}

export class DeleteGearset implements Action {
  readonly type = GearsetsActionTypes.DeleteGearset;

  constructor(public key: string) {
  }
}

export type GearsetsAction = LoadGearsets | GearsetsLoaded | LoadGearset | GearsetLoaded | SelectGearset | UpdateGearset | DeleteGearset | CreateGearset | ImportGearset;

