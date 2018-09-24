import { Component, OnInit } from '@angular/core';
import { ListsFacade } from '../../../modules/list/+state/lists.facade';
import { List } from '../../../modules/list/model/list';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-lists',
  templateUrl: './lists.component.html',
  styleUrls: ['./lists.component.less']
})
export class ListsComponent implements OnInit {

  public lists$ = this.listsFacade.myLists$;

  public loading$ = this.listsFacade.loadingMyLists$.pipe(tap((loading) => console.log('Loading my lists : ', loading)));

  constructor(private listsFacade: ListsFacade) {
  }

  ngOnInit(): void {
    this.listsFacade.loadAll();
  }

  createList(): void {
    this.listsFacade.createEmptyList();
  }

  trackByList(index: number, list: List): string {
    return list.$key;
  }
}
