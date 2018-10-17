import { Action } from '@ngrx/store';
import { Workshop } from '../../../model/other/workshop';

export enum WorkshopsActionTypes {
  LoadMyWorkshops = '[Workshops] Load My Workshops',
  LoadWorkshop = '[Workshops] Load Workshop',
  LoadWorkshopsWithWriteAccess = '[Workshops] Load Workshops With Write Access',
  SelectWorkshop = '[Workshops] Select Workshop',

  MyWorkshopsLoaded = '[Workshops] My Workshops Loaded',
  WorkshopsWithWriteAccessLoaded = '[Workshops] Workshops With Write Access Loaded',

  CreateWorkshop = '[Workshops] Create Workshop',
  UpdateWorkshopIndex = '[Workshops] Update Workshop Index',
  UpdateWorkshop = '[Workshops] Update Workshop',
  DeleteWorkshop = '[Workshops] Delete Workshop',
}

export class LoadMyWorkshops implements Action {
  readonly type = WorkshopsActionTypes.LoadMyWorkshops;
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
  | DeleteWorkshop;
