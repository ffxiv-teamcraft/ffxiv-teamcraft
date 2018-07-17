import {ChangeDetectionStrategy, Component} from '@angular/core';
import {NotificationService} from '../../../core/notification/notification.service';
import {Observable} from 'rxjs/index';
import {NotificationRelationship} from '../../../core/notification/notification-relationship';
import {LocalizedDataService} from '../../../core/data/localized-data.service';
import {I18nToolsService} from '../../../core/tools/i18n-tools.service';
import {TranslateService} from '@ngx-translate/core';
import {TeamService} from '../../../core/database/team.service';
import {TeamInviteNotification} from '../../../model/notification/team-invite-notification';
import {SettingsService} from '../../settings/settings.service';

@Component({
    selector: 'app-notifications',
    templateUrl: './notifications.component.html',
    styleUrls: ['./notifications.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationsComponent {

    public notifications$: Observable<NotificationRelationship[]>;

    constructor(private notificationService: NotificationService,
                public l12n: LocalizedDataService, public i18nTools: I18nToolsService,
                public translate: TranslateService, private teamService: TeamService,
                public settings: SettingsService) {
        this.notifications$ = this.notificationService.notifications$;
    }

    public markAllAsRead(notifications: NotificationRelationship[]): void {
        notifications.forEach(notification => this.markAsRead(notification));
    }

    public markAsRead(notification: NotificationRelationship): void {
        notification.to.read = true;
        this.notificationService.set(notification.$key, notification);
    }

    public answerQuestion(notification: NotificationRelationship, answer: boolean): void {
        switch (notification.to.type) {
            case 'TEAM_INVITE':
                if (answer) {
                    (<TeamInviteNotification>notification.to).team.confirmMember(notification.from);
                } else {
                    (<TeamInviteNotification>notification.to).team.removeMember(notification.from);
                }
                this.teamService.set((<TeamInviteNotification>notification.to).team.$key, (<TeamInviteNotification>notification.to).team)
                    .subscribe();
                break;
            default:
                break;
        }
        this.notificationService.remove(notification.$key).subscribe();
    }

    public trackByNotificationFn(index: number, notification: NotificationRelationship): string {
        return notification.$key;
    }

}
