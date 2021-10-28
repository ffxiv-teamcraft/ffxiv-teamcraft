import { Component, OnInit } from '@angular/core';
import { ModificationEntry } from '../../../modules/list/model/modification-entry';
import { ListsFacade } from '../../../modules/list/+state/lists.facade';
import { Observable } from 'rxjs';
import { first, map } from 'rxjs/operators';

@Component({
  selector: 'app-list-history-popup',
  templateUrl: './list-history-popup.component.html',
  styleUrls: ['./list-history-popup.component.less']
})
export class ListHistoryPopupComponent implements OnInit {

  public history$: Observable<ModificationEntry[]>;

  constructor(private listsFacade: ListsFacade) {
  }

  public undo(entry: ModificationEntry): void {
    this.listsFacade.selectedList$.pipe(
      first()
    )
      .subscribe(list => {
        list.modificationsHistory = list.modificationsHistory.filter(e => e.date !== entry.date);
        this.listsFacade.updateList(list);
        this.listsFacade.setItemDone(entry.itemId, entry.itemIcon, entry.finalItem, -1 * entry.amount, entry.recipeId, entry.total);
      });
  }

  ngOnInit() {
    this.history$ = this.listsFacade.selectedList$.pipe(
      map(list => {
        return list.modificationsHistory.sort((a, b) => a.date > b.date ? -1 : 1);
      })
    );
  }

}
