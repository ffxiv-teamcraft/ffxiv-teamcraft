import { Component } from '@angular/core';
import { NzModalRef } from 'ng-zorro-antd';
import { ListsFacade } from '../+state/lists.facade';
import { List } from '../model/list';
import { Router } from '@angular/router';

@Component({
  selector: 'app-list-completion-popup',
  templateUrl: './list-completion-popup.component.html',
  styleUrls: ['./list-completion-popup.component.less']
})
export class ListCompletionPopupComponent {

  list: List;

  constructor(private ref: NzModalRef, private listsFacade: ListsFacade, private router: Router) {
  }

  close(): void {
    this.ref.close();
  }

  deleteList(): void {
    this.listsFacade.deleteList(this.list.$key, this.list.offline);
    this.router.navigate(['/lists']);
    this.close();
  }

  resetList(): void {
    this.list.reset();
    this.listsFacade.updateList(this.list);
    this.close();
  }

  clearList(): void {
    this.list.finalItems = [];
    this.list.items = [];
    this.list.modificationsHistory = [];
    this.listsFacade.updateList(this.list, true, true);
    this.close();
  }
}
