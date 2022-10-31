import { DataWithPermissions } from '../../../core/database/permissions/data-with-permissions';
import { ProcessedListAggregate } from './processed-list-aggregate';

export class ListAggregate extends DataWithPermissions {

  lists: string[];

  index = 0;

  layout: string;

  static fromProcessed(processed: ProcessedListAggregate): ListAggregate {
    const aggregate = new ListAggregate();
    aggregate.lists = processed.lists.map(list => list.$key);
    return aggregate;
  }
}
