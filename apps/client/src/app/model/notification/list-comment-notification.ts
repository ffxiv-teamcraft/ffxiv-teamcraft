import { AbstractNotification } from '../../core/notification/abstract-notification';
import { TranslateService } from '@ngx-translate/core';
import { I18nToolsService } from '../../core/tools/i18n-tools.service';
import { NotificationType } from '../../core/notification/notification-type';
import { Observable } from 'rxjs';

export class ListCommentNotification extends AbstractNotification {

  constructor(private comment: string, private listName: string, target: string) {
    super(NotificationType.LIST_COMMENT, target);
  }

  getContent(translate: TranslateService, i18nTools: I18nToolsService): Observable<string> {
    return translate.get('NOTIFICATIONS.List_comment_added', {
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
