import { Component } from '@angular/core';
import { ModificationEntry } from '../../../modules/list/model/modification-entry';
import { ListsFacade } from '../../../modules/list/+state/lists.facade';
import { Observable } from 'rxjs';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { tap } from 'rxjs/operators';
import { CharacterNamePipe } from '../../../pipes/pipes/character-name.pipe';
import { ItemNamePipe } from '../../../pipes/pipes/item-name.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { I18nPipe } from '../../../core/i18n.pipe';
import { PageLoaderComponent } from '../../../modules/page-loader/page-loader/page-loader.component';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzWaveModule } from 'ng-zorro-antd/core/wave';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { UserAvatarComponent } from '../../../modules/user-avatar/user-avatar/user-avatar.component';
import { LazyScrollComponent } from '../../../modules/lazy-scroll/lazy-scroll/lazy-scroll.component';
import { NzListModule } from 'ng-zorro-antd/list';
import { NgIf, AsyncPipe, DatePipe } from '@angular/common';

@Component({
    selector: 'app-list-history-popup',
    templateUrl: './list-history-popup.component.html',
    styleUrls: ['./list-history-popup.component.less'],
    standalone: true,
    imports: [NgIf, NzListModule, LazyScrollComponent, UserAvatarComponent, NzButtonModule, NzWaveModule, NzToolTipModule, NzIconModule, NzEmptyModule, PageLoaderComponent, AsyncPipe, DatePipe, I18nPipe, TranslateModule, ItemNamePipe, CharacterNamePipe]
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
