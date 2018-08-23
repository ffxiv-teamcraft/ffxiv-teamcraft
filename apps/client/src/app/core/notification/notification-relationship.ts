import { Relationship } from '../database/relational/relationship';
import { AbstractNotification } from './abstract-notification';
import { DeserializeAs } from '@kaiu/serializer';

export class NotificationRelationship<T = AbstractNotification> extends Relationship<string, T> {

  from: string;

  @DeserializeAs(AbstractNotification)
  to: T;
}
