import { Component } from '@angular/core';
import { ModificationEntry } from '../../../modules/list/model/modification-entry';
import { ListsFacade } from '../../../modules/list/+state/lists.facade';
import { Observable, switchMap } from 'rxjs';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { finalize, first, tap } from 'rxjs/operators';

@Component({
  selector: 'app-list-history-popup',
  templateUrl: './list-history-popup.component.html',
  styleUrls: ['./list-history-popup.component.less']
})
export class ListHistoryPopupComponent {

  loading = false;

  public history$: Observable<ModificationEntry[]> = this.listsFacade.selectedListKey$.pipe(
    first(),
    switchMap(key => this.listsFacade.getListModificationsHistory(key)),
    tap(() => this.loading = false),
    finalize(() => console.log('CLEANED'))
  );

  constructor(private listsFacade: ListsFacade, private modalRef: NzModalRef) {
    modalRef.afterClose.subscribe(() => modalRef.destroy());
  }

  public undo(entry: ModificationEntry): void {
    this.loading = true;
    this.listsFacade.removeModificationsHistoryEntry(entry.id);
    this.listsFacade.setItemDone({
      itemId: entry.itemId,
      itemIcon: null,
      finalItem: entry.finalItem,
      delta: -1 * entry.amount,
      recipeId: entry.recipeId,
      totalNeeded: entry.total,
      external: false,
      fromPacket: false,
      hq: false,
      skipHistory: true
    });
  }

}
