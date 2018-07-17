import {NotificationWithQuestion} from '../../core/notification/notification-with-question';
import {I18nToolsService} from '../../core/tools/i18n-tools.service';
import {LocalizedDataService} from '../../core/data/localized-data.service';
import {TranslateService} from '@ngx-translate/core';
import {NotificationType} from '../../core/notification/notification-type';
import {Team} from '../other/team';
import {DeserializeAs} from '@kaiu/serializer';

export class TeamInviteNotification extends NotificationWithQuestion {

    @DeserializeAs(Team)
    public readonly team: Team;

    public constructor(private invitedBy: string, team: Team) {
        super(NotificationType.TEAM_INVITE);
        this.team = team;
    }

    getContent(translate: TranslateService, l12n: LocalizedDataService, i18nTools: I18nToolsService): string {
        return translate.instant('NOTIFICATIONS.Team_invite', {
            invitedBy: this.invitedBy,
            teamName: this.team.name
        });
    }

    getIcon(): string {
        return 'person_add';
    }

    getTargetRoute(): string[] {
        return undefined;
    }

}
