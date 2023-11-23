import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { combineLatest, map, ReplaySubject } from 'rxjs';
import { AbstractItemRowComponent } from '../abstract-item-row.component';
import { ListRow } from '../../model/list-row';
import { ProcessedListAggregate } from '../../../list-aggregate/model/processed-list-aggregate';
import { LazyIconPipe } from '../../../../pipes/pipes/lazy-icon.pipe';
import { CeilPipe } from '../../../../pipes/pipes/ceil.pipe';
import { ItemNamePipe } from '../../../../pipes/pipes/item-name.pipe';
import { I18nRowPipe } from '../../../../core/i18n/i18n-row.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { I18nPipe } from '../../../../core/i18n.pipe';
import { ItemSourcesDisplayComponent } from '../item-sources-display/item-sources-display.component';
import { FormsModule } from '@angular/forms';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { MapPositionComponent } from '../../../map/map-position/map-position.component';
import { AlarmButtonComponent } from '../../../alarm-button/alarm-button/alarm-button.component';
import { TutorialStepDirective } from '../../../../core/tutorial/tutorial-step.directive';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { InventoryPositionComponent } from '../../../inventory/inventory-position/inventory-position.component';
import { NzWaveModule } from 'ng-zorro-antd/core/wave';
import { UserAvatarComponent } from '../../../user-avatar/user-avatar/user-avatar.component';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { I18nNameComponent } from '../../../../core/i18n/i18n-name/i18n-name.component';
import { ItemNameClipboardDirective } from '../../../../core/item-name-clipboard.directive';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { ItemIconComponent } from '../../../item-icon/item-icon/item-icon.component';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { FlexModule } from '@angular/flex-layout/flex';
import { NgIf, NgFor, AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-aggregate-item-row',
    templateUrl: './aggregate-item-row.component.html',
    styleUrls: ['./aggregate-item-row.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NgIf, FlexModule, NzGridModule, ItemIconComponent, NzButtonModule, NzIconModule, NzToolTipModule, ItemNameClipboardDirective, I18nNameComponent, NzTagModule, NgFor, UserAvatarComponent, NzWaveModule, InventoryPositionComponent, NzDropDownModule, NzMenuModule, TutorialStepDirective, AlarmButtonComponent, MapPositionComponent, NzPopoverModule, NzInputNumberModule, FormsModule, ItemSourcesDisplayComponent, AsyncPipe, I18nPipe, TranslateModule, I18nRowPipe, ItemNamePipe, CeilPipe, LazyIconPipe]
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
