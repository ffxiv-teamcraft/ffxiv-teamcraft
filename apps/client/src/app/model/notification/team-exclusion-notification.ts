import { AbstractNotification } from '../../core/notification/abstract-notification';
import { TranslateService } from '@ngx-translate/core';
import { LocalizedDataService } from '../../core/data/localized-data.service';
import { I18nToolsService } from '../../core/tools/i18n-tools.service';
import { NotificationType } from '../../core/notification/notification-type';

export class TeamExclusionNotification extends AbstractNotification {

  constructor(public teamName: string) {
    super(NotificationType.TEAM_EXCLUSION);
  }

  getContent(translate: TranslateService, l12n: LocalizedDataService, i18nTools: I18nToolsService): string {
    return translate.instant('NOTIFICATIONS.Team_exclusion', {
      teamName: this.teamName
    });
  }

  getIcon(): string {
    return 'person_add_disabled';
  }

  getTargetRoute(): string[] {
    return undefined;
  }

}
