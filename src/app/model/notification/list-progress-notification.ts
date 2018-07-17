import {AbstractNotification} from '../../core/notification/abstract-notification';
import {NotificationType} from '../../core/notification/notification-type';
import {TranslateService} from '@ngx-translate/core';
import {LocalizedDataService} from '../../core/data/localized-data.service';
import {I18nToolsService} from '../../core/tools/i18n-tools.service';

/**
 * This class describes a notification for when a progress has been made on an item.
 *
 * Example: "Miu Asakura added 3 Copper Ore to "Copper ingot" "
 */
export class ListProgressNotification extends AbstractNotification {

    constructor(public listName: string, public modificationAuthorName: string, public amount: number,
                public itemId: number, public listId: string) {
        super(NotificationType.LIST_PROGRESS);
    }

    getContent(translate: TranslateService, l12n: LocalizedDataService, i18nTools: I18nToolsService): string {
        return translate.instant('NOTIFICATIONS.List_progress', {
            author: this.modificationAuthorName,
            amount: this.amount,
            listName: this.listName,
            itemName: i18nTools.getName(l12n.getItem(this.itemId))
        });
    }

    getTargetRoute(): string[] {
        return ['/list', this.listId];
    }

    getIcon(): string {
        return 'playlist_add_check';
    }
}
