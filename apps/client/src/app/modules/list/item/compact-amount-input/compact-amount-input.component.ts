import { Component, Input } from '@angular/core';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ListRow } from '../../model/list-row';
import { PermissionLevel } from '../../../../core/database/permissions/permission-level.enum';
import { ProcessedListAggregate } from '../../../list-aggregate/model/processed-list-aggregate';
import { TeamcraftComponent } from '../../../../core/component/teamcraft-component';
import { ListsFacade } from '../../+state/lists.facade';
import { SettingsService } from '../../../settings/settings.service';
import { FormsModule } from '@angular/forms';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzWaveModule } from 'ng-zorro-antd/core/wave';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NgIf } from '@angular/common';

@Component({
    selector: 'app-compact-amount-input',
    templateUrl: './compact-amount-input.component.html',
    styleUrls: ['./compact-amount-input.component.less'],
    standalone: true,
    imports: [NgIf, NzButtonModule, NzWaveModule, NzIconModule, NzInputNumberModule, FormsModule]
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
      this.listsFacade.setItemDone({
        itemId: item.id,
        itemIcon: item.icon,
        finalItem: this.finalItem,
        delta: newValue - item.done,
        recipeId: item.recipeId,
        totalNeeded: item.amount
      });
    }
    item.done = newValue;
  }

  add(amount: string | number, item: ListRow, external = false): void {
    if (this.aggregate) {
      this.aggregate.generateSetItemDone(item, +amount, this.finalItem)(this.listsFacade);
    } else {
      this.listsFacade.setItemDone({
        itemId: item.id,
        itemIcon: item.icon,
        finalItem: this.finalItem,
        delta: +amount,
        recipeId: item.recipeId,
        totalNeeded: item.amount,
        external: external
      });
    }
    item.done += +amount;
  }

  remove(amount: string, item: ListRow, external = false): void {
    if (this.aggregate) {
      this.aggregate.generateSetItemDone(item, -1 * (+amount), this.finalItem)(this.listsFacade);
    } else {
      this.listsFacade.setItemDone({
        itemId: item.id,
        itemIcon: item.icon,
        finalItem: this.finalItem,
        delta: -1 * (+amount),
        recipeId: item.recipeId,
        totalNeeded: item.amount,
        external: external
      });
    }
  }

  markAsDone(item: ListRow): void {
    if (this.aggregate) {
      this.aggregate.generateSetItemDone(item, item.amount - item.done, this.finalItem)(this.listsFacade);
    } else {
      this.listsFacade.setItemDone({
        itemId: item.id,
        itemIcon: item.icon,
        finalItem: this.finalItem,
        delta: item.amount - item.done,
        recipeId: item.recipeId,
        totalNeeded: item.amount
      });
    }
    item.done = item.amount;
  }

  resetDone(item: ListRow): void {
    if (this.aggregate) {
      this.aggregate.generateSetItemDone(item, -1 * item.done, this.finalItem)(this.listsFacade);
    } else {
      this.listsFacade.setItemDone({
        itemId: item.id,
        itemIcon: item.icon,
        finalItem: this.finalItem,
        delta: -1 * item.done,
        recipeId: item.recipeId,
        totalNeeded: item.amount
      });
    }
    item.done = 0;
  }
}
