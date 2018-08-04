import {AbstractNotification} from './abstract-notification';
import {NotificationType} from './notification-type';

export abstract class NotificationWithQuestion extends AbstractNotification {

    isQuestion = true;

    protected constructor(public readonly type: NotificationType) {
        super(type);
    }
}
