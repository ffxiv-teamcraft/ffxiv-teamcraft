import { ListController } from '../../list/list-controller';
import { ListAggregatePriority } from './list-aggregate-priority';
import { List } from '../../list/model/list';
import { DataWithPermissions } from '../../../core/database/permissions/data-with-permissions';
import { ListRow } from '../../list/model/list-row';
import { ListsFacade } from '../../list/+state/lists.facade';

export class ProcessedListAggregate extends DataWithPermissions {

  public priority: ListAggregatePriority = ListAggregatePriority.LEAST_REQUIRED_TO_MOST;

  public readonly aggregatedList: List = new List();

  public teamId: string;

  public assignedItems: { [id: number]: { user: string, list: string, array: string, amount: number }[] } = {};

  public itemListLinks: Record<number, { list: string, amount: number, totalNeeded: number }[]> = {};

  constructor(public readonly lists: List[]) {
    super();
    this.aggregatedList = lists.reduce((acc, list) => {
      Object.assign(this.registry, list.registry);
      list.items.forEach(item => {
        this.addListLinkForItem(item, list.$key);
        if (item.workingOnIt) {
          this.assignedItems[item.id] = [
            ...(this.assignedItems[item.id] || []),
            ...item.workingOnIt.map(userId => {
              return {
                user: userId,
                list: list.$key,
                array: 'items',
                amount: item.amount
              };
            })
          ];
        }
      });
      list.finalItems.forEach(item => {
        this.addListLinkForItem(item, list.$key);
        if (item.workingOnIt) {
          this.assignedItems[item.id] = [
            ...(this.assignedItems[item.id] || []),
            ...item.workingOnIt.map(userId => {
              return {
                user: userId,
                list: list.$key,
                array: 'finalItems',
                amount: item.amount
              };
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

  private addListLinkForItem(item: ListRow, listId: string): void {
    this.itemListLinks[item.id] = this.itemListLinks[item.id] || [];
    const itemRow = this.itemListLinks[item.id].find(e => e.list === listId);
    if (itemRow) {
      itemRow.amount += (item.amount - item.done);
      itemRow.totalNeeded += item.amount;
    } else {
      this.itemListLinks[item.id].push({
        list: listId,
        amount: (item.amount - item.done),
        totalNeeded: item.amount
      });
    }
  }

  public generateSetItemDone(item: ListRow, _delta: number, finalItem: boolean): (facade: ListsFacade) => void {
    let delta = _delta;
    const patches = (this.itemListLinks[item.id]).map(row => {
      if (delta < 0) {
        if (row.totalNeeded > Math.abs(delta)) {
          const deltaToApply = delta;
          delta += row.totalNeeded;
          return { list: row.list, delta: deltaToApply };
        } else {
          delta += row.totalNeeded;
          return { list: row.list, delta: -row.totalNeeded };
        }
      } else {
        if (row.amount > delta) {
          const deltaToApply = delta;
          delta -= row.amount;
          return { list: row.list, delta: deltaToApply };
        } else {
          delta -= row.amount;
          return { list: row.list, delta: row.amount };
        }
      }
    });
    return facade => {
      patches.forEach(row => {
        if (row.delta !== 0) {
          facade.setListItemDone(row.list, item.id, item.icon, finalItem, row.delta, item.recipeId, item.amount);
        }
      });
      ListController.setDone(this.aggregatedList, item.id, _delta, !finalItem, finalItem, false, item.recipeId, false);
      ListController.updateAllStatuses(this.aggregatedList, item.id);
    };
  }

}
