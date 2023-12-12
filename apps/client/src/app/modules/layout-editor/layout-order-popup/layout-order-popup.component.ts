import { Component } from '@angular/core';
import { ListLayout } from '../../../core/layout/list-layout';
import { LayoutRow } from '../../../core/layout/layout-row';
import { CdkDragDrop, moveItemInArray, CdkDropList, CdkDrag } from '@angular/cdk/drag-drop';
import { NgFor } from '@angular/common';

@Component({
    selector: 'app-layout-order-popup',
    templateUrl: './layout-order-popup.component.html',
    styleUrls: ['./layout-order-popup.component.less'],
    standalone: true,
    imports: [CdkDropList, NgFor, CdkDrag]
})
export class LayoutOrderPopupComponent {

  public layout: ListLayout;

  drop(event: CdkDragDrop<LayoutRow[]>) {
    moveItemInArray(this.layout.rows, event.previousIndex, event.currentIndex);
    this.layout.rows = this.layout.rows.map((row, index) => {
      row.index = index;
      return row;
    });
  }

}
