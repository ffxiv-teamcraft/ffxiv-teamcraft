import { CommissionMessage } from './commission-message';
import { DeserializeAs } from '@kaiu/serializer';
import { DataModel } from '../../core/database/storage/data-model';

export class CommissionDiscussion extends DataModel {

  @DeserializeAs([CommissionMessage])
  messages: CommissionMessage[] = [];

  constructor(public readonly crafterId: string) {
    super();
  }
}
