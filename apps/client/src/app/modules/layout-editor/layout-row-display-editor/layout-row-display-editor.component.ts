import { Component, inject } from '@angular/core';
import { ItemRowMenuElement } from '../../../model/display/item-row-menu-element';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { TranslateModule } from '@ngx-translate/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { FormsModule } from '@angular/forms';
import { NzSelectModule } from 'ng-zorro-antd/select';

import { FlexModule } from '@angular/flex-layout/flex';

@Component({
  selector: 'app-layout-row-display-editor',
  templateUrl: './layout-row-display-editor.component.html',
  styleUrls: ['./layout-row-display-editor.component.less'],
  standalone: true,
  imports: [FlexModule, NzSelectModule, FormsModule, NzButtonModule, TranslateModule]
})
export class LayoutRowDisplayEditorComponent {

  types = ItemRowMenuElement;

  allTypes = Object.keys(this.types)
    .map(key => +key)
    .filter(res => this.types[res] !== undefined);

  data = inject(NZ_MODAL_DATA);

  get layout() {
    return this.data.layout;
  }

  constructor(private modalRef: NzModalRef) {
  }

  currentType(type: ItemRowMenuElement): 'button' | 'menu' {
    if (this.layout.rowsDisplay.buttons.indexOf(type) > -1) {
      return 'button';
    }
    return 'menu';
  }

  setType(item: ItemRowMenuElement, type: 'button' | 'menu'): void {
    if (type === 'menu') {
      this.layout.rowsDisplay.buttons = this.layout.rowsDisplay.buttons.filter(i => i !== item);
      this.layout.rowsDisplay.menu = [...this.layout.rowsDisplay.menu, item];
    } else {
      this.layout.rowsDisplay.menu = this.layout.rowsDisplay.menu.filter(i => i !== item);
      this.layout.rowsDisplay.buttons = [...this.layout.rowsDisplay.buttons, item];
    }
  }

  close(): void {
    this.modalRef.close(this.layout);
  }

}
