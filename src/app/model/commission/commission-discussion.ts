import {CommissionMessage} from './commission-message';
import {DeserializeAs} from '@kaiu/serializer';

export class CommissionDiscussion {

    @DeserializeAs([CommissionMessage])
    messages: CommissionMessage[] = [];

    constructor(public readonly crafterId: string) {
    }
}
