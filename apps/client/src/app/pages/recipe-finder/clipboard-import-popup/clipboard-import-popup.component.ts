import { Component } from '@angular/core';
import { NzModalRef } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-clipboard-import-popup',
  templateUrl: './clipboard-import-popup.component.html',
  styleUrls: ['./clipboard-import-popup.component.less']
})
export class ClipboardImportPopupComponent {

  items: { id: number, amount: number }[] = [];

  constructor(private ref: NzModalRef) {
  }

  confirm(): void {
    this.ref.close(this.items);
  }

  cancel(): void {
    this.ref.close(null);
  }
}
