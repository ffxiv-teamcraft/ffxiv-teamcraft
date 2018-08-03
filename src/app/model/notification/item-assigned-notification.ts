import {AbstractNotification} from '../../core/notification/abstract-notification';
import {TranslateService} from '@ngx-translate/core';
import {LocalizedDataService} from '../../core/data/localized-data.service';
import {I18nToolsService} from '../../core/tools/i18n-tools.service';
import {NotificationType} from '../../core/notification/notification-type';

export class ItemAssignedNotification extends AbstractNotification {

    constructor(private itemId: number, private listName: string, private listId: string) {
        super(NotificationType.ITEM_ASSIGNED);
    }

    getContent(translate: TranslateService, l12n: LocalizedDataService, i18nTools: I18nToolsService): string {
        return translate.instant('NOTIFICATIONS.Item_assigned', {
            itemName: i18nTools.getName(l12n.getItem(this.itemId)),
            listName: this.listName
        });
    }

    getIcon(): string {
        return 'assignment_ind';
    }

    getTargetRoute(): string[] {
        return ['/list', this.listId];
    }

}
