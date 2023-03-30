import { Component } from '@angular/core';
import { ModificationEntry } from '../../../modules/list/model/modification-entry';
import { ListsFacade } from '../../../modules/list/+state/lists.facade';
import { Observable } from 'rxjs';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-list-history-popup',
  templateUrl: './list-history-popup.component.html',
  styleUrls: ['./list-history-popup.component.less']
})
export class ListHistoryPopupComponent {

  loading = false;

  public history$: Observable<ModificationEntry[]> = this.listsFacade.selectedListModificationHistory$.pipe(
    tap(() => this.loading = false)
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
