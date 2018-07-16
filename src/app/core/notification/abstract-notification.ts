import {NotificationType} from './notification-type';
import {Parent} from '@kaiu/serializer';

@Parent({
    allowSelf: false,
    discriminatorField: 'type'
})
export abstract class AbstractNotification {

    protected constructor(public readonly type: NotificationType) {
    }
}
