import {ChangeDetectionStrategy, Component} from '@angular/core';
import {NotificationService} from '../../../core/notification/notification.service';
import {Observable} from 'rxjs/index';
import {NotificationRelationship} from '../../../core/notification/notification-relationship';
import {LocalizedDataService} from '../../../core/data/localized-data.service';
import {I18nToolsService} from '../../../core/tools/i18n-tools.service';
import {TranslateService} from '@ngx-translate/core';

@Component({
    selector: 'app-notifications',
    templateUrl: './notifications.component.html',
    styleUrls: ['./notifications.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationsComponent {

    public notifications$: Observable<NotificationRelationship[]>;

    constructor(private notificationService: NotificationService,
                public l12n: LocalizedDataService, public i18nTools: I18nToolsService, public translate: TranslateService) {
        this.notifications$ = this.notificationService.notifications$;
    }

    public markAllAsRead(notifications: NotificationRelationship[]): void {
        notifications.forEach(notification => this.markAsRead(notification));
    }

    public markAsRead(notification: NotificationRelationship): void {
        notification.to.read = true;
        this.notificationService.set(notification.$key, notification);
    }

}
