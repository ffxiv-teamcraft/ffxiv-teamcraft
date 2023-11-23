import { Component } from '@angular/core';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { I18nPipe } from '../../../core/i18n.pipe';
import { LazyIconPipe } from '../../../pipes/pipes/lazy-icon.pipe';
import { ItemNamePipe } from '../../../pipes/pipes/item-name.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { NzWaveModule } from 'ng-zorro-antd/core/wave';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { ItemIconComponent } from '../../../modules/item-icon/item-icon/item-icon.component';
import { NgFor } from '@angular/common';
import { FlexModule } from '@angular/flex-layout/flex';

@Component({
    selector: 'app-clipboard-import-popup',
    templateUrl: './clipboard-import-popup.component.html',
    styleUrls: ['./clipboard-import-popup.component.less'],
    standalone: true,
    imports: [FlexModule, NgFor, ItemIconComponent, NzButtonModule, NzWaveModule, TranslateModule, ItemNamePipe, LazyIconPipe, I18nPipe]
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
