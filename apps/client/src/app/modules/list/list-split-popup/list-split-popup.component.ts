import { ChangeDetectionStrategy, Component } from '@angular/core';
import { List } from '../model/list';
import { ListPickerService } from '../../list-picker/list-picker.service';
import { ListRow } from '../model/list-row';
import { ListsFacade } from '../+state/lists.facade';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { ListController } from '../list-controller';
import { ListManagerService } from '../list-manager.service';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-list-split-popup',
  templateUrl: './list-split-popup.component.html',
  styleUrls: ['./list-split-popup.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListSplitPopupComponent {

  public list: List;

  public removeFromList = true;

  public selectedItems = [];

  public constructor(private listPicker: ListPickerService, private listsFacade: ListsFacade,
                     private modalRef: NzModalRef, private listManager: ListManagerService) {
  }

  setSelection(item: ListRow, selected: boolean): void {
    if (selected) {
      this.selectedItems.push(item.id);
    } else {
      this.selectedItems = this.selectedItems.filter(i => i !== item.id);
    }
  }

  selectNotCompletedItems(): void {
    this.selectedItems = this.list.finalItems.filter(item => {
      return item.done < item.amount;
    }).map(item => item.id);
  }

  isSelected(itemId: number): boolean {
    return this.selectedItems.includes(itemId);
  }

  split(): void {
    const itemsToAdd = this.list.finalItems.filter(row => this.selectedItems.includes(row.id));
    this.listPicker.addToList(...itemsToAdd);
    if (this.removeFromList) {
      this.list.finalItems = this.list.finalItems.filter(row => !this.selectedItems.includes(row.id));
      this.listManager.upgradeList(ListController.updateEtag(ListController.clean(this.list))).pipe(
        first()
      ).subscribe(res => {
        this.listsFacade.updateList(res);
      });
    }
    this.modalRef.close();
  }

}
