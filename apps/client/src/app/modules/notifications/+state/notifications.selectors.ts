import { createFeatureSelector, createSelector } from '@ngrx/store';
import { NotificationsState } from './notifications.reducer';

// Lookup the 'Notifications' feature state managed by NgRx
const getNotificationsState = createFeatureSelector<NotificationsState>(
  'notifications'
);

const getLoaded = createSelector(
  getNotificationsState,
  (state: NotificationsState) => state.loaded
);

const getAllNotifications = createSelector(
  getNotificationsState,
  getLoaded,
  (state: NotificationsState, isLoaded) => {
    return isLoaded ? state.list : [];
  }
);

export const notificationsQuery = {
  getLoaded,
  getAllNotifications
};
