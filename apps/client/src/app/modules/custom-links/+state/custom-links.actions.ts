import { Action } from '@ngrx/store';
import { CustomLink } from '../../../core/database/custom-links/custom-link';

export enum CustomLinksActionTypes {
  LoadMyCustomLinks = '[CustomLinks] Load My CustomLinks',
  MyCustomLinksLoaded = '[CustomLinks] My CustomLinks Loaded',

  SelectCustomLink = '[CustomLinks] Select Custom Link',
  LoadCustomLink = '[CustomLinks] Load Custom Link',
  CustomLinkLoaded = '[CustomLinks] Custom Link Loaded',
  UpdateCustomLink = '[CustomLinks] Update Custom Link',
  CreateCustomLink = '[CustomLinks] Create Custom Link',
  DeleteCustomLink = '[CustomLinks] Delete Custom Link',
}

export class LoadMyCustomLinks implements Action {
  readonly type = CustomLinksActionTypes.LoadMyCustomLinks;
}

export class MyCustomLinksLoaded implements Action {
  readonly type = CustomLinksActionTypes.MyCustomLinksLoaded;

  constructor(public payload: CustomLink[], public userId: string) {
  }
}

export class SelectCustomLink implements Action {
  readonly type = CustomLinksActionTypes.SelectCustomLink;

  constructor(public key: string) {
  }
}

export class LoadCustomLink implements Action {
  readonly type = CustomLinksActionTypes.LoadCustomLink;

  constructor(public nickname: string, public linkName: string, public template: boolean) {
  }
}

export class UpdateCustomLink implements Action {
  readonly type = CustomLinksActionTypes.UpdateCustomLink;

  constructor(public link: CustomLink) {
  }
}

export class CustomLinkLoaded implements Action {
  readonly type = CustomLinksActionTypes.CustomLinkLoaded;

  constructor(public link: CustomLink) {
  }
}

export class CreateCustomLink implements Action {
  readonly type = CustomLinksActionTypes.CreateCustomLink;

  constructor(public link: CustomLink) {
  }
}

export class DeleteCustomLink implements Action {
  readonly type = CustomLinksActionTypes.DeleteCustomLink;

  constructor(public key: string) {
  }
}


export type CustomLinksAction =
  | LoadMyCustomLinks
  | CustomLinkLoaded
  | MyCustomLinksLoaded
  | SelectCustomLink
  | LoadCustomLink
  | UpdateCustomLink
  | CreateCustomLink
  | DeleteCustomLink;

