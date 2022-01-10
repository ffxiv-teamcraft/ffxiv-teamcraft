import { Action } from '@ngrx/store';
import { TeamcraftGearset } from '../../../model/gearset/teamcraft-gearset';
import { GearsetProgression } from '../../../model/gearset/gearset-progression';

export enum GearsetsActionTypes {
  CreateGearset = '[Gearsets] Create Gearset',
  ImportAriyalaGearset = '[Gearsets] Import Ariyala Gearset',
  ImportEtroGearset = '[Gearsets] Import Etro Gearset',
  ImportLodestoneGearset = '[Gearsets] Import Lodestone Gearset',
  ImportFromPcap = '[Gearsets] Import From Pcap',
  SyncFromPcap = '[Gearsets] Sync From Pcap',

  LoadGearsets = '[Gearsets] Load Gearsets',
  GearsetsLoaded = '[Gearsets] Gearsets Loaded',

  LoadGearset = '[Gearsets] Load Gearset',
  GearsetLoaded = '[Gearsets] Gearset Loaded',

  SaveGearsetProgression = '[Gearsets] Save Gearset Progression',
  LoadGearsetProgression = '[Gearsets] Load Gearset Progression',
  GearsetProgressionLoaded = '[Gearsets] Gearset Progression Loaded',

  SelectGearset = '[Gearsets] Select Gearset',
  UpdateGearset = '[Gearsets] Update Gearset',
  UpdateGearsetIndexes = '[Gearsets] Update Gearset indexes',
  PureUpdateGearset = '[Gearsets] Pure Update Gearset',
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

export class UpdateGearsetIndexes implements Action {
  readonly type = GearsetsActionTypes.UpdateGearsetIndexes;

  constructor(public payload: TeamcraftGearset[]) {
  }
}

export class CreateGearset implements Action {
  readonly type = GearsetsActionTypes.CreateGearset;

  constructor(public gearset?: TeamcraftGearset, public preventNavigation = false) {
  }
}

export class ImportAriyalaGearset implements Action {
  readonly type = GearsetsActionTypes.ImportAriyalaGearset;
}

export class ImportEtroGearset implements Action {
  readonly type = GearsetsActionTypes.ImportEtroGearset;
}

export class ImportFromPcap implements Action {
  readonly type = GearsetsActionTypes.ImportFromPcap;
}

export class SyncFromPcap implements Action {
  readonly type = GearsetsActionTypes.SyncFromPcap;
}

export class ImportLodestoneGearset implements Action {
  readonly type = GearsetsActionTypes.ImportLodestoneGearset;
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

export class SaveGearsetProgression implements Action {
  readonly type = GearsetsActionTypes.SaveGearsetProgression;

  constructor(public key: string, public progression: GearsetProgression) {
  }
}

export class LoadGearsetProgression implements Action {
  readonly type = GearsetsActionTypes.LoadGearsetProgression;

  constructor(public key: string) {
  }
}

export class GearsetProgressionLoaded implements Action {
  readonly type = GearsetsActionTypes.GearsetProgressionLoaded;

  constructor(public key: string, public payload: GearsetProgression) {
  }
}

export class SelectGearset implements Action {
  readonly type = GearsetsActionTypes.SelectGearset;

  constructor(public key: string) {
  }
}

export class UpdateGearset implements Action {
  readonly type = GearsetsActionTypes.UpdateGearset;

  constructor(public key: string, public gearset: TeamcraftGearset, public isReadonly: boolean) {
  }
}

export class PureUpdateGearset implements Action {
  readonly type = GearsetsActionTypes.PureUpdateGearset;

  constructor(public key: string, public gearset: Partial<TeamcraftGearset>) {
  }
}

export class DeleteGearset implements Action {
  readonly type = GearsetsActionTypes.DeleteGearset;

  constructor(public key: string) {
  }
}

export type GearsetsAction =
  LoadGearsets
  | GearsetsLoaded
  | LoadGearset
  | GearsetLoaded
  | SelectGearset
  | UpdateGearset
  | DeleteGearset
  | CreateGearset
  | ImportAriyalaGearset
  | ImportEtroGearset
  | ImportLodestoneGearset
  | ImportFromPcap
  | PureUpdateGearset
  | UpdateGearsetIndexes
  | GearsetProgressionLoaded
  | LoadGearsetProgression
  | SaveGearsetProgression;

