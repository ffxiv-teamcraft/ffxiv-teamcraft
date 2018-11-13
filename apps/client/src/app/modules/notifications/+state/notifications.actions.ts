import { Action } from '@ngrx/store';
import { AbstractNotification } from '../../../core/notification/abstract-notification';

export enum NotificationsActionTypes {
  LoadNotifications = '[Notifications] Load Notifications',
  NotificationsLoaded = '[Notifications] Notifications Loaded'
}

export class LoadNotifications implements Action {
  readonly type = NotificationsActionTypes.LoadNotifications;
}

export class NotificationsLoaded implements Action {
  readonly type = NotificationsActionTypes.NotificationsLoaded;
  constructor(public payload: AbstractNotification[]) {}
}

export type NotificationsAction =
  | LoadNotifications
  | NotificationsLoaded;
