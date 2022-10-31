import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { combineLatest, map, ReplaySubject } from 'rxjs';
import { AbstractItemRowComponent } from '../abstract-item-row.component';
import { ListRow } from '../../model/list-row';
import { ProcessedListAggregate } from '../../../list-aggregate/model/processed-list-aggregate';

@Component({
  selector: 'app-aggregate-item-row',
  templateUrl: './aggregate-item-row.component.html',
  styleUrls: ['./aggregate-item-row.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AggregateItemRowComponent extends AbstractItemRowComponent implements OnInit {
  private aggregate$ = new ReplaySubject<ProcessedListAggregate>();

  list$ = this.aggregate$.pipe(
    map(aggregate => aggregate.aggregatedList)
  );

  @Input()
  public set aggregate(data: ProcessedListAggregate) {
    this.aggregate$.next(data);
  }

  workingOnIt$ = combineLatest([this.aggregate$, this.item$]).pipe(
    map(([aggregate, item]) => {
      return aggregate.assignedItems[item.id];
    })
  );

  ngOnInit() {
    super.ngOnInit();
    this.connectListObservables();
  }

  /**
   * TODO Implement amount/used logic with list aggregate
   */
  itemDoneChanged(newValue: number, item: ListRow): void {
    if (newValue.toString().length === 0) {
      return;
    }
    if (this.settings.displayRemaining) {
      newValue += item.used;
    }
    this.listsFacade.setItemDone(item.id, item.icon, this.finalItem, newValue - item.done, item.recipeId, item.amount);
  }

  add(amount: string | number, item: ListRow, external = false): void {
    // Amount is typed to string because it's from input value, which is always considered as string.
    this.listsFacade.setItemDone(item.id, item.icon, this.finalItem, +amount, item.recipeId, item.amount, external);
  }

  remove(amount: string, item: ListRow, external = false): void {
    // Amount is typed to string because it's from input value, which is always considered as string.
    this.listsFacade.setItemDone(item.id, item.icon, this.finalItem, -1 * (+amount), item.recipeId, item.amount, external);
  }

  markAsDone(item: ListRow): void {
    this.listsFacade.setItemDone(item.id, item.icon, this.finalItem, item.amount - item.done, item.recipeId, item.amount);
  }

  resetDone(item: ListRow): void {
    this.listsFacade.setItemDone(item.id, item.icon, this.finalItem, -1 * item.done, item.recipeId, item.amount);
  }
}
