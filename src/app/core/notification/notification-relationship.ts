import {Relationship} from '../database/relational/relationship';
import {AbstractNotification} from './abstract-notification';
import {DeserializeAs} from '@kaiu/serializer';

export class NotificationRelationship extends Relationship<string, AbstractNotification> {

    from: string;

    @DeserializeAs(AbstractNotification)
    to: AbstractNotification;
}
