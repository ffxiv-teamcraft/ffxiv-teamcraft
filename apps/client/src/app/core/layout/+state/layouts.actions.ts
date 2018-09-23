import { Action } from '@ngrx/store';
import { ListLayout } from '../list-layout';

export enum LayoutsActionTypes {
  LoadLayouts = '[Layouts] Load Layouts',
  LayoutsLoaded = '[Layouts] Layouts Loaded',
  SelectLayout = '[Layouts] Select Layout',
}

export class LoadLayouts implements Action {
  readonly type = LayoutsActionTypes.LoadLayouts;
}

export class LayoutsLoaded implements Action {
  readonly type = LayoutsActionTypes.LayoutsLoaded;

  constructor(public payload: ListLayout[]) {
  }
}

export class SelectLayout implements Action {
  readonly type = LayoutsActionTypes.SelectLayout;

  constructor(public key: string) {
  }
}

export type LayoutsAction = LoadLayouts | LayoutsLoaded | SelectLayout;

export const fromLayoutsActions = {
  LoadLayouts,
  LayoutsLoaded,
  SelectLayout
};
