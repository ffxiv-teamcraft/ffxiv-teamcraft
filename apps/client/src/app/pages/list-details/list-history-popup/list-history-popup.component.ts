import { Component } from '@angular/core';
import { ModificationEntry } from '../../../modules/list/model/modification-entry';
import { ListsFacade } from '../../../modules/list/+state/lists.facade';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-list-history-popup',
  templateUrl: './list-history-popup.component.html',
  styleUrls: ['./list-history-popup.component.less']
})
export class ListHistoryPopupComponent {

  public history$: Observable<ModificationEntry[]> = this.listsFacade.selectedListModificationHistory$.pipe(
    map(entries => {
      return (entries || []).sort((a, b) => b.date - a.date);
    })
  );

  constructor(private listsFacade: ListsFacade) {
  }

  public undo(entry: ModificationEntry): void {
    this.listsFacade.selectedListKey$
      .subscribe(([key]) => {
        this.listsFacade.removeModificationsHistoryEntry(key, entry.$key);
        this.listsFacade.setItemDone(entry.itemId, null, entry.finalItem, -1 * entry.amount, entry.recipeId, entry.total);
      });
  }

}
