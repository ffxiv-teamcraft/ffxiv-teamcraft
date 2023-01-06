import { Component, Input } from '@angular/core';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ListRow } from '../../model/list-row';
import { PermissionLevel } from '../../../../core/database/permissions/permission-level.enum';
import { ProcessedListAggregate } from '../../../list-aggregate/model/processed-list-aggregate';
import { TeamcraftComponent } from '../../../../core/component/teamcraft-component';
import { ListsFacade } from '../../+state/lists.facade';
import { SettingsService } from '../../../settings/settings.service';

@Component({
  selector: 'app-compact-amount-input',
  templateUrl: './compact-amount-input.component.html',
  styleUrls: ['./compact-amount-input.component.less']
})
export class CompactAmountInputComponent extends TeamcraftComponent {
  @Input()
  checkButtonAfter = false;

  @Input()
  permissionLevel: PermissionLevel;

  @Input()
  item: ListRow;

  @Input()
  aggregate?: ProcessedListAggregate;

  @Input()
  finalItem?: boolean;

  public itemDoneChange$ = new Subject<number>();

  constructor(private listsFacade: ListsFacade, public settings: SettingsService) {
    super();

    this.itemDoneChange$.pipe(
      takeUntil(this.onDestroy$),
      debounceTime(1000)
    ).subscribe(value => {
      this.itemDoneChanged(value, this.item);
    });
  }


  itemDoneChanged(newValue: number, item: ListRow): void {
    if (newValue.toString().length === 0) {
      return;
    }
    if (this.settings.displayRemaining) {
      newValue += item.used;
    }
    if (this.aggregate) {
      this.aggregate.generateSetItemDone(item, newValue - item.done, this.finalItem)(this.listsFacade);
    } else {
      this.listsFacade.setItemDone(item.id, item.icon, this.finalItem, newValue - item.done, item.recipeId, item.amount);
    }
    item.done = newValue;
  }

  add(amount: string | number, item: ListRow, external = false): void {
    if (this.aggregate) {
      this.aggregate.generateSetItemDone(item, +amount, this.finalItem)(this.listsFacade);
    } else {
      this.listsFacade.setItemDone(item.id, item.icon, this.finalItem, +amount, item.recipeId, item.amount, external);
    }
    item.done += +amount;
  }

  remove(amount: string, item: ListRow, external = false): void {
    if (this.aggregate) {
      this.aggregate.generateSetItemDone(item, -1 * (+amount), this.finalItem)(this.listsFacade);
    } else {
      this.listsFacade.setItemDone(item.id, item.icon, this.finalItem, -1 * (+amount), item.recipeId, item.amount, external);
    }
  }

  markAsDone(item: ListRow): void {
    if (this.aggregate) {
      this.aggregate.generateSetItemDone(item, item.amount - item.done, this.finalItem)(this.listsFacade);
    } else {
      this.listsFacade.setItemDone(item.id, item.icon, this.finalItem, item.amount - item.done, item.recipeId, item.amount);
    }
    item.done = item.amount;
  }

  resetDone(item: ListRow): void {
    if (this.aggregate) {
      this.aggregate.generateSetItemDone(item, -1 * item.done, this.finalItem)(this.listsFacade);
    } else {
      this.listsFacade.setItemDone(item.id, item.icon, this.finalItem, -1 * item.done, item.recipeId, item.amount);
    }
    item.done = 0;
  }
}
