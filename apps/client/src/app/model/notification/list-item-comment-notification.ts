import { AbstractNotification } from '../../core/notification/abstract-notification';
import { TranslateService } from '@ngx-translate/core';
import { I18nToolsService } from '../../core/tools/i18n-tools.service';
import { NotificationType } from '../../core/notification/notification-type';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

export class ListItemCommentNotification extends AbstractNotification {

  constructor(private listId: string, private itemId: number, private comment: string, private listName: string, target: string) {
    super(NotificationType.LIST_ITEM_COMMENT, target);
  }

  getContent(translate: TranslateService, i18nTools: I18nToolsService): Observable<string> {
    return i18nTools.getNameObservable('items', this.itemId).pipe(
      switchMap(itemName => {
        return translate.get('NOTIFICATIONS.List_item_comment_added', {
          itemName: itemName,
          content: this.comment,
          listName: this.listName
        });
      })
    );
  }

  getIcon(): string {
    return 'form';
  }

  getTargetRoute(): string[] {
    return ['/list', this.listId];
  }

}
