import { Component } from '@angular/core';
import { ListLayout } from '../../../core/layout/list-layout';
import { LayoutRow } from '../../../core/layout/layout-row';
import { CdkDragDrop, moveItemInArray, CdkDropList, CdkDrag } from '@angular/cdk/drag-drop';

import { DialogComponent } from '../../../core/dialog.component';

@Component({
  selector: 'app-layout-order-popup',
  templateUrl: './layout-order-popup.component.html',
  styleUrls: ['./layout-order-popup.component.less'],
  standalone: true,
  imports: [CdkDropList, CdkDrag]
})
export class LayoutOrderPopupComponent extends DialogComponent {

  public layout: ListLayout;

  constructor() {
    super();
    this.patchData();
  }

  drop(event: CdkDragDrop<LayoutRow[]>) {
    moveItemInArray(this.layout.rows, event.previousIndex, event.currentIndex);
    this.layout.rows = this.layout.rows.map((row, index) => {
      row.index = index;
      return row;
    });
  }

}
