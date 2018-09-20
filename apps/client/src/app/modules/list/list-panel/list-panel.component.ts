import { Component, Input, OnInit } from '@angular/core';
import { List } from '../model/list';
import { ListsFacade } from '../+state/lists.facade';

@Component({
  selector: 'app-list-panel',
  templateUrl: './list-panel.component.html',
  styleUrls: ['./list-panel.component.less']
})
export class ListPanelComponent implements OnInit {

  @Input()
  list: List;

  constructor(private listsFacade: ListsFacade) {
  }

  deleteList(list: List): void {
    this.listsFacade.deleteList(list.$key);
  }

  ngOnInit() {
  }

}
