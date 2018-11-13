import { Injectable } from '@angular/core';

import { Store } from '@ngrx/store';

import { NotificationsState } from './notifications.reducer';
import { notificationsQuery } from './notifications.selectors';
import { LoadNotifications } from './notifications.actions';

@Injectable()
export class NotificationsFacade {
  loaded$ = this.store.select(notificationsQuery.getLoaded);
  allNotifications$ = this.store.select(notificationsQuery.getAllNotifications);

  constructor(private store: Store<{ notifications: NotificationsState }>) {}

  loadAll() {
    this.store.dispatch(new LoadNotifications());
  }
}
