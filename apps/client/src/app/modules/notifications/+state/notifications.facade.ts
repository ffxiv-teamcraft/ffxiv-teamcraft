import { Injectable } from '@angular/core';

import { Store } from '@ngrx/store';

import { NotificationsState } from './notifications.reducer';
import { notificationsQuery } from './notifications.selectors';
import { LoadNotifications, RemoveNotification } from './notifications.actions';
import { first, map } from 'rxjs/operators';
import { LocalizedDataService } from '../../../core/data/localized-data.service';
import { TranslateService } from '@ngx-translate/core';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { NotificationType } from '../../../core/notification/notification-type';
import { CommissionNotification } from '../../../model/notification/commission-notification';

@Injectable()
export class NotificationsFacade {
  loaded$ = this.store.select(notificationsQuery.getLoaded);
  allNotifications$ = this.store.select(notificationsQuery.getAllNotifications);

  notificationsDisplay$ = this.allNotifications$.pipe(
    map(notifications => {
      return notifications.map(notification => {
        const content = notification.getContent(this.translate, this.l12n, this.i18n);
        const cropped = content.slice(0, 120);
        const contentStr = content.length !== cropped.length ? `${cropped}...` : cropped;
        return {
          ...notification,
          content: contentStr,
          icon: notification.getIcon(),
          route: notification.getTargetRoute()
        };
      });
    })
  );

  constructor(private store: Store<{ notifications: NotificationsState }>, private translate: TranslateService,
              private l12n: LocalizedDataService, private i18n: I18nToolsService) {
  }

  removeCommissionNotifications(predicate: (n: CommissionNotification) => boolean): void {
    this.allNotifications$.pipe(
      first(),
      map(notifications => notifications.filter(n => {
        return n.type === NotificationType.COMMISSION && predicate(n as CommissionNotification);
      }))
    ).subscribe(notifications => {
      notifications.forEach(n => this.removeNotification(n.$key));
    });
  }

  removeNotification(key: string): void {
    this.store.dispatch(new RemoveNotification(key));
  }

  loadAll() {
    this.store.dispatch(new LoadNotifications());
  }
}
