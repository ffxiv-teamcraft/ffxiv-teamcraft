import { Component } from '@angular/core';
import { CustomItemsFacade } from '../../../modules/custom-items/+state/custom-items.facade';
import { CustomItem } from '../../../modules/custom-items/model/custom-item';
import { NzModalRef } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-custom-items-export-popup',
  templateUrl: './custom-items-export-popup.component.html',
  styleUrls: ['./custom-items-export-popup.component.less']
})
export class CustomItemsExportPopupComponent {

  public items$ = this.customItemsFacade.allCustomItems$;

  public selectedItems: CustomItem[] = [];

  constructor(private customItemsFacade: CustomItemsFacade, private modalRef: NzModalRef) {
  }

  public setSelection(item: CustomItem, selected: boolean): void {
    if (selected) {
      this.selectedItems.push(item);
    } else {
      this.selectedItems = this.selectedItems.filter(i => i.$key !== item.$key);
    }
  }

  public exportItems(): void {
    this.modalRef.close(this.selectedItems);
  }

}
