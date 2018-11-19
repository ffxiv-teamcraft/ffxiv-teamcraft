import {
  NotificationsAction,
  NotificationsActionTypes
} from './notifications.actions';
import { AbstractNotification } from '../../../core/notification/abstract-notification';

export interface NotificationsState {
  list: AbstractNotification[]; // list of Notifications; analogous to a sql normalized table
  loaded: boolean; // has the Notifications list been loaded
}

export const initialState: NotificationsState = {
  list: [],
  loaded: false
};

export function notificationsReducer(
  state: NotificationsState = initialState,
  action: NotificationsAction
): NotificationsState {
  switch (action.type) {
    case NotificationsActionTypes.NotificationsLoaded: {
      state = {
        ...state,
        list: action.payload,
        loaded: true
      };
      break;
    }

    case NotificationsActionTypes.RemoveNotification: {
      state = {
        ...state,
        list: [...state.list.filter(n => n.$key !== action.key)]
      };
      break;
    }
  }
  return state;
}
