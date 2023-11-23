import { Component, Input } from '@angular/core';
import { List } from '../../../modules/list/model/list';
import { Inventory } from '../../../model/other/inventory';
import { BehaviorSubject, combineLatest, Observable, ReplaySubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { LazyIconPipe } from '../../../pipes/pipes/lazy-icon.pipe';
import { ItemNamePipe } from '../../../pipes/pipes/item-name.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { I18nPipe } from '../../../core/i18n.pipe';
import { ItemNameClipboardDirective } from '../../../core/item-name-clipboard.directive';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NgFor, NgIf, AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { FlexModule } from '@angular/flex-layout/flex';

@Component({
    selector: 'app-inventory-view',
    templateUrl: './inventory-view.component.html',
    styleUrls: ['./inventory-view.component.less'],
    standalone: true,
    imports: [FlexModule, NzSwitchModule, FormsModule, NgFor, NzToolTipModule, NgIf, ItemNameClipboardDirective, AsyncPipe, I18nPipe, TranslateModule, ItemNamePipe, LazyIconPipe]
})
export class InventoryViewComponent {

  public display$: Observable<{ id: number, icon: number, amount: number }[][]>;

  public showFinalItems$ = new BehaviorSubject<boolean>(localStorage.getItem('inventory-view:show-final') !== 'false');

  private list$: ReplaySubject<List> = new ReplaySubject<List>();

  public constructor() {
    this.display$ = combineLatest([this.list$, this.showFinalItems$]).pipe(
      tap(([, showFinal]) => {
        localStorage.setItem('inventory-view:show-final', showFinal.toString());
      }),
      map(([list, showFinalitems]) => {
        const inventory = new Inventory();
        list.items.forEach(item => {
          inventory.add(item.id, item.icon, item.done - item.used);
        });
        if (showFinalitems) {
          list.finalItems.forEach(item => {
            inventory.add(item.id, item.icon, item.done - item.used);
          });
        }
        return inventory.getDisplay();
      })
    );
  }

  @Input()
  public set list(l: List) {
    this.list$.next(l);
  }

}
