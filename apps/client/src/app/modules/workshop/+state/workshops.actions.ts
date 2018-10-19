import { Action } from '@ngrx/store';
import { Workshop } from '../../../model/other/workshop';

export enum WorkshopsActionTypes {
  LoadMyWorkshops = '[Workshops] Load My Workshops',
  LoadWorkshop = '[Workshops] Load Workshop',
  LoadWorkshopsWithWriteAccess = '[Workshops] Load Workshops With Write Access',
  SelectWorkshop = '[Workshops] Select Workshop',

  MyWorkshopsLoaded = '[Workshops] My Workshops Loaded',
  WorkshopLoaded = '[Workshops] Workshop Loaded',
  WorkshopsWithWriteAccessLoaded = '[Workshops] Workshops With Write Access Loaded',

  CreateWorkshop = '[Workshops] Create Workshop',
  UpdateWorkshopIndex = '[Workshops] Update Workshop Index',
  UpdateWorkshop = '[Workshops] Update Workshop',
  RemoveListFromWorkshop = '[Workshops] Remove List from Workshop',
  DeleteWorkshop = '[Workshops] Delete Workshop',
}

export class LoadMyWorkshops implements Action {
  readonly type = WorkshopsActionTypes.LoadMyWorkshops;
}

export class LoadWorkshop implements Action {
  readonly type = WorkshopsActionTypes.LoadWorkshop;

  constructor(public readonly key: string) {
  }
}

export class WorkshopLoaded implements Action {
  readonly type = WorkshopsActionTypes.WorkshopLoaded;

  constructor(public readonly workshop: Partial<Workshop>) {
  }
}

export class LoadWorkshopsWithWriteAccess implements Action {
  readonly type = WorkshopsActionTypes.LoadWorkshopsWithWriteAccess;
}

export class SelectWorkshop implements Action {
  readonly type = WorkshopsActionTypes.SelectWorkshop;

  constructor(public readonly key: string) {
  }
}

export class MyWorkshopsLoaded implements Action {
  readonly type = WorkshopsActionTypes.MyWorkshopsLoaded;

  constructor(public payload: Workshop[]) {
  }
}

export class WorkshopsWithWriteAccessLoaded implements Action {
  readonly type = WorkshopsActionTypes.WorkshopsWithWriteAccessLoaded;

  constructor(public payload: Workshop[]) {
  }
}

export class CreateWorkshop implements Action {
  readonly type = WorkshopsActionTypes.CreateWorkshop;

  constructor(public readonly payload: Workshop) {
  }
}

export class UpdateWorkshop implements Action {
  readonly type = WorkshopsActionTypes.UpdateWorkshop;

  constructor(public readonly payload: Workshop) {
  }
}

export class RemoveListFromWorkshop implements Action {
  readonly type = WorkshopsActionTypes.RemoveListFromWorkshop;

  constructor(public readonly listKey:string, public readonly workshopKey:string) {
  }
}

export class UpdateWorkshopIndex implements Action {
  readonly type = WorkshopsActionTypes.UpdateWorkshopIndex;

  constructor(public readonly payload: Workshop) {
  }
}

export class DeleteWorkshop implements Action {
  readonly type = WorkshopsActionTypes.DeleteWorkshop;

  constructor(public readonly key: string) {
  }
}

export type WorkshopsAction =
  LoadMyWorkshops
  | MyWorkshopsLoaded
  | CreateWorkshop
  | SelectWorkshop
  | UpdateWorkshopIndex
  | LoadWorkshopsWithWriteAccess
  | WorkshopsWithWriteAccessLoaded
  | UpdateWorkshop
  | LoadWorkshop
  | WorkshopLoaded
  | DeleteWorkshop;
