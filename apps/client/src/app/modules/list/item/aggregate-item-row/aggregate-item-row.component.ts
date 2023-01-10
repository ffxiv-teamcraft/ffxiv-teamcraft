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

  private _aggregate: ProcessedListAggregate;

  @Input()
  public set aggregate(data: ProcessedListAggregate) {
    this._aggregate = data;
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

  itemDoneChanged(newValue: number, item: ListRow): void {
    if (newValue.toString().length === 0) {
      return;
    }
    if (this.settings.displayRemaining) {
      newValue += item.used;
    }
    this._aggregate.generateSetItemDone(item, newValue - item.done, this.finalItem)(this.listsFacade);
  }

  add(amount: string | number, item: ListRow, external = false): void {
    // Amount is typed to string because it's from input value, which is always considered as string.
    this._aggregate.generateSetItemDone(item, +amount, this.finalItem)(this.listsFacade);
  }

  remove(amount: string, item: ListRow, external = false): void {
    // Amount is typed to string because it's from input value, which is always considered as string.
    this._aggregate.generateSetItemDone(item, -1 * (+amount), this.finalItem)(this.listsFacade);
  }

  markAsDone(item: ListRow): void {
    this._aggregate.generateSetItemDone(item, item.amount - item.done, this.finalItem)(this.listsFacade);
  }

  resetDone(item: ListRow): void {
    this._aggregate.generateSetItemDone(item, -1 * item.done, this.finalItem)(this.listsFacade);
  }
}
