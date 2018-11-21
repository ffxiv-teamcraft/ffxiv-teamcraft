import { Action } from '@ngrx/store';
import { AbstractNotification } from '../../../core/notification/abstract-notification';

export enum NotificationsActionTypes {
  LoadNotifications = '[Notifications] Load Notifications',
  NotificationsLoaded = '[Notifications] Notifications Loaded',
  RemoveNotification = '[Notifications] Remove Notification',
}

export class LoadNotifications implements Action {
  readonly type = NotificationsActionTypes.LoadNotifications;
}

export class NotificationsLoaded implements Action {
  readonly type = NotificationsActionTypes.NotificationsLoaded;

  constructor(public payload: AbstractNotification[]) {
  }
}

export class RemoveNotification implements Action {
  readonly type = NotificationsActionTypes.RemoveNotification;

  constructor(public key: string) {
  }
}

export type NotificationsAction =
  | LoadNotifications
  | NotificationsLoaded
  | RemoveNotification;
