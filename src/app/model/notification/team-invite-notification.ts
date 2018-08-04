import {NotificationWithQuestion} from '../../core/notification/notification-with-question';
import {I18nToolsService} from '../../core/tools/i18n-tools.service';
import {LocalizedDataService} from '../../core/data/localized-data.service';
import {TranslateService} from '@ngx-translate/core';
import {NotificationType} from '../../core/notification/notification-type';
import {Team} from '../other/team';

export class TeamInviteNotification extends NotificationWithQuestion {

    public teamName: string;

    public teamId: string;

    public constructor(private invitedBy: string, team: Team) {
        super(NotificationType.TEAM_INVITE);
        this.teamName = team.name;
        this.teamId = team.$key;
    }

    getContent(translate: TranslateService, l12n: LocalizedDataService, i18nTools: I18nToolsService): string {
        return translate.instant('NOTIFICATIONS.Team_invite', {
            invitedBy: this.invitedBy,
            teamName: this.teamName
        });
    }

    getIcon(): string {
        return 'person_add';
    }

    getTargetRoute(): string[] {
        return undefined;
    }

}
