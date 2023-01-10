import { Action } from '@ngrx/store';
import { ListLayout } from '../list-layout';

export enum LayoutsActionTypes {
  LoadLayouts = '[Layouts] Load Layouts',
  LoadLayout = '[Layouts] Load Layout',
  LayoutsLoaded = '[Layouts] Layouts Loaded',
  LayoutLoaded = '[Layouts] Layout Loaded',
  SelectLayout = '[Layouts] Select layout',
  CreateLayout = '[Layouts] Create layout',
  DeleteLayout = '[Layouts] Delete layout',
  UpdateLayout = '[Layouts] Update layout'
}

export class LoadLayouts implements Action {
  readonly type = LayoutsActionTypes.LoadLayouts;
}

export class LoadLayout implements Action {
  readonly type = LayoutsActionTypes.LoadLayout;

  constructor(public readonly key: string) {
  }
}

export class LayoutsLoaded implements Action {
  readonly type = LayoutsActionTypes.LayoutsLoaded;

  constructor(public payload: ListLayout[]) {
  }
}

export class LayoutLoaded implements Action {
  readonly type = LayoutsActionTypes.LayoutLoaded;

  constructor(public payload: ListLayout) {
  }
}

export class SelectLayout implements Action {
  readonly type = LayoutsActionTypes.SelectLayout;

  constructor(public key: string) {
  }
}

export class CreateLayout implements Action {
  readonly type = LayoutsActionTypes.CreateLayout;

  constructor(public readonly layout: ListLayout) {
  }
}

export class UpdateLayout implements Action {
  readonly type = LayoutsActionTypes.UpdateLayout;

  constructor(public readonly layout: ListLayout) {
  }
}

export class DeleteLayout implements Action {
  readonly type = LayoutsActionTypes.DeleteLayout;

  constructor(public readonly key: string) {
  }
}

export type LayoutsAction = LoadLayouts | LayoutsLoaded | SelectLayout | CreateLayout | DeleteLayout | UpdateLayout | LoadLayout | LayoutLoaded;

export const fromLayoutsActions = {
  LoadLayouts,
  LayoutsLoaded,
  SelectLayout,
  CreateLayout,
  DeleteLayout,
  UpdateLayout,
  LoadLayout,
  LayoutLoaded
};
