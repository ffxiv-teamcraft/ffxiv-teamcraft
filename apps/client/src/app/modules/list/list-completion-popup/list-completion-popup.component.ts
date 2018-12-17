import { Component } from '@angular/core';
import { NzModalRef } from 'ng-zorro-antd';
import { ListsFacade } from '../+state/lists.facade';
import { List } from '../model/list';

@Component({
  selector: 'app-list-completion-popup',
  templateUrl: './list-completion-popup.component.html',
  styleUrls: ['./list-completion-popup.component.less']
})
export class ListCompletionPopupComponent {

  list: List;

  constructor(private ref: NzModalRef, private listsFacade: ListsFacade) {
  }

  close(): void {
    this.ref.close();
  }

  deleteList(): void {
    this.listsFacade.deleteList(this.list.$key);
    this.close();
  }

  resetList(): void {
    this.list.reset();
    this.listsFacade.updateList(this.list);
    this.close();
  }
}
