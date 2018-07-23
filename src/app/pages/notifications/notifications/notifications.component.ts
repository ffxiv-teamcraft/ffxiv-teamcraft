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
import {first, map, mergeMap} from 'rxjs/operators';

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

    public remove(notification: NotificationRelationship): void {
        this.notificationService.remove(notification.$key);
    }

    public answerQuestion(notification: NotificationRelationship<TeamInviteNotification>, answer: boolean): void {
        switch (notification.to.type) {
            case 'TEAM_INVITE':
                this.teamService.get(notification.to.teamId)
                    .pipe(
                        first(),
                        map(team => {
                            if (answer) {
                                team.confirmMember(notification.from);
                            } else {
                                team.removeMember(notification.from);
                            }
                            return team;
                        }),
                        mergeMap(team => {
                            return this.teamService.set(team.$key, team);
                        })
                    ).subscribe();
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
