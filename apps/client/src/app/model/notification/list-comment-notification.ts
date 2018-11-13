import { AbstractNotification } from '../../core/notification/abstract-notification';
import { TranslateService } from '@ngx-translate/core';
import { LocalizedDataService } from '../../core/data/localized-data.service';
import { I18nToolsService } from '../../core/tools/i18n-tools.service';
import { NotificationType } from '../../core/notification/notification-type';

export class ListCommentNotification extends AbstractNotification {

  constructor(private userName: string, private comment: string, private listName: string) {
    super(NotificationType.LIST_COMMENT);
  }

  getContent(translate: TranslateService, l12n: LocalizedDataService, i18nTools: I18nToolsService): string {
    return translate.instant('NOTIFICATIONS.List_commented', {
      userName: this.userName,
      content: this.comment,
      listName: this.listName
    });
  }

  getIcon(): string {
    return 'form';
  }

  getTargetRoute(): string[] {
    return ['/lists'];
  }

}
