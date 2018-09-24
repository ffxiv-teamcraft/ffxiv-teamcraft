import { Component } from '@angular/core';
import { ListsFacade } from '../../../modules/list/+state/lists.facade';
import { List } from '../../../modules/list/model/list';

@Component({
  selector: 'app-lists',
  templateUrl: './lists.component.html',
  styleUrls: ['./lists.component.less']
})
export class ListsComponent {

  public lists$ = this.listsFacade.myLists$;

  public loading$ = this.listsFacade.loadingMyLists$;

  constructor(private listsFacade: ListsFacade) {
  }

  createList(): void {
    this.listsFacade.createEmptyList();
  }

  trackByList(index: number, list: List): string {
    return list.$key;
  }
}
