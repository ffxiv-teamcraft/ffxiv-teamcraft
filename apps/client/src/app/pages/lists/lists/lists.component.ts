import { Component } from '@angular/core';
import { ListsFacade } from '../../../modules/list/+state/lists.facade';
import { List } from '../../../modules/list/model/list';
import { Observable } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-lists',
  templateUrl: './lists.component.html',
  styleUrls: ['./lists.component.less']
})
export class ListsComponent {

  public lists$: Observable<List[]>;

  public loading$: Observable<boolean>;

  constructor(private listsFacade: ListsFacade) {
    this.lists$ = this.listsFacade.myLists$.pipe(
      debounceTime(100)
    );
    this.loading$ = this.listsFacade.loadingMyLists$;
  }

  createList(): void {
    this.listsFacade.createEmptyList();
  }

  setListIndex(list: List, index: number, lists: List[]): void {
    // Remove list from the array
    lists = lists.filter(l => l.$key !== list.$key);
    // Insert it at new index
    lists.splice(index, 0, list);
    // Update indexes and persist
    lists
      .filter((l, i) => l.index !== i)
      .map((l, i) => {
        l.index = i;
        return l;
      })
      .forEach(l => {
        this.listsFacade.updateListIndex(l);
      });

  }

  trackByList(index: number, list: List): string {
    return list.$key;
  }
}
