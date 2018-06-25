import {CommissionMessage} from './commission-message';
import {DeserializeAs} from '@kaiu/serializer';

export class CommissionDiscussion {
    crafterId: string;

    @DeserializeAs([CommissionMessage])
    messages: CommissionMessage[] = [];
}
