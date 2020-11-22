import { Component } from '@angular/core';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { AdditionPickerEntry } from './addition-picker-entry';


@Component({
  selector: 'app-folder-addition-picker',
  templateUrl: './folder-addition-picker.component.html',
  styleUrls: ['./folder-addition-picker.component.less']
})
export class FolderAdditionPickerComponent {

  public elements: AdditionPickerEntry[] = [];

  private selected: AdditionPickerEntry[] = [];

  constructor(private modalRef: NzModalRef) {
  }

  public setSelection(element: AdditionPickerEntry, selected: boolean): void {
    if (selected) {
      this.selected.push(element);
    } else {
      this.selected = this.selected.filter(e => e.$key !== element.$key);
    }
  }

  close(): void {
    this.modalRef.close(this.selected);
  }

}
