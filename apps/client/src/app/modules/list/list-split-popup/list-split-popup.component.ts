import { ChangeDetectionStrategy, Component } from '@angular/core';
import { List } from '../model/list';
import { ListPickerService } from '../../list-picker/list-picker.service';
import { ListRow } from '../model/list-row';
import { ListsFacade } from '../+state/lists.facade';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { ListController } from '../list-controller';
import { ListManagerService } from '../list-manager.service';
import { first, switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { ItemNamePipe } from '../../../pipes/pipes/item-name.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { I18nPipe } from '../../../core/i18n.pipe';
import { ItemIconComponent } from '../../item-icon/item-icon/item-icon.component';
import { FormsModule } from '@angular/forms';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { LazyScrollComponent } from '../../lazy-scroll/lazy-scroll/lazy-scroll.component';
import { NzWaveModule } from 'ng-zorro-antd/core/wave';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { FlexModule } from '@angular/flex-layout/flex';

@Component({
    selector: 'app-list-split-popup',
    templateUrl: './list-split-popup.component.html',
    styleUrls: ['./list-split-popup.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [FlexModule, NzButtonModule, NzWaveModule, LazyScrollComponent, NzCheckboxModule, FormsModule, ItemIconComponent, I18nPipe, TranslateModule, ItemNamePipe]
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
    this.listPicker.addToList(...itemsToAdd).pipe(
      switchMap(() => {
        if (this.removeFromList) {
          this.list.finalItems = this.list.finalItems.filter(row => !this.selectedItems.includes(row.id));
          return this.listManager.upgradeList(ListController.updateEtag(ListController.clean(this.list))).pipe(
            first(),
            tap(res =>              this.listsFacade.updateList(res))
          );
        }
        return of(null)
      })
    ).subscribe(() => {
      this.modalRef.close();
    });
  }

}
