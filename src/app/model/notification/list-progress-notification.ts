import {AbstractNotification} from '../../core/notification/abstract-notification';
import {NotificationType} from '../../core/notification/notification-type';

/**
 * This class describes a notification for when a progress has been made on an item.
 *
 * Example: "Miu Asakura added 3 Copper Ore to "Copper ingot" "
 */
export class ListProgressNotification extends AbstractNotification {

    constructor(public listName: string, public modificationAuthorName: string, public amount: number,
                public itemId: number) {
        super(NotificationType.LIST_PROGRESS);
    }
}
