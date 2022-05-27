import { ListController } from '../../../modules/list/list-controller';
import { ListAggregatePriority } from './list-aggregate-priority';
import { List } from '../../../modules/list/model/list';
import { DataWithPermissions } from '../../../core/database/permissions/data-with-permissions';

export class ListAggregate extends DataWithPermissions {

  public priority: ListAggregatePriority = ListAggregatePriority.LEAST_REQUIRED_TO_MOST;

  public readonly aggregatedList: List = new List();

  public teamId: string;

  public assignedItems: { [id: number]: { user: string, list: string, array: string, amount: number }[] } = {};

  constructor(public readonly lists: List[]) {
    super();
    this.aggregatedList = lists.reduce((acc, list) => {
      Object.assign(this.registry, list.registry);
      list.items.forEach(item => {
        if (item.workingOnIt) {
          this.assignedItems[item.id] = [
            ...(this.assignedItems[item.id] || []),
            ...item.workingOnIt.map(userId => {
              return {
                user: userId,
                list: list.$key,
                array: 'items',
                amount: item.amount
              }
            })
          ];
        }
      });
      list.finalItems.forEach(item => {
        if (item.workingOnIt) {
          this.assignedItems[item.id] = [
            ...(this.assignedItems[item.id] || []),
            ...item.workingOnIt.map(userId => {
              return {
                user: userId,
                list: list.$key,
                array: 'finalItems',
                amount: item.amount
              }
            })
          ];
        }
      });
      this.everyone = Math.min(this.everyone, list.everyone);
      if (this.teamId === undefined) {
        this.teamId = list.teamId;
      }
      if (this.authorId === undefined) {
        this.authorId = list.authorId;
      }
      return ListController.merge(acc, ListController.clone(list, true));
    }, new List());
  }

}
