import { Injectable } from '@angular/core';

import { Store } from '@ngrx/store';

import { NotificationsState } from './notifications.reducer';
import { notificationsQuery } from './notifications.selectors';
import { LoadNotifications } from './notifications.actions';
import { map } from 'rxjs/operators';
import { LocalizedDataService } from '../../../core/data/localized-data.service';
import { TranslateService } from '@ngx-translate/core';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';

@Injectable()
export class NotificationsFacade {
  loaded$ = this.store.select(notificationsQuery.getLoaded);
  allNotifications$ = this.store.select(notificationsQuery.getAllNotifications);

  notificationsDisplay$ = this.allNotifications$.pipe(
    map(notifications => {
      return notifications.map(notification => {
        return {
          ...notification,
          content: notification.getContent(this.translate, this.l12n, this.i18n),
          icon: notification.getIcon(),
          route: notification.getTargetRoute()
        };
      });
    })
  );

  constructor(private store: Store<{ notifications: NotificationsState }>, private translate: TranslateService,
              private l12n: LocalizedDataService, private i18n: I18nToolsService) {
  }

  loadAll() {
    this.store.dispatch(new LoadNotifications());
  }
}
