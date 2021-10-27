import { Component, Input } from '@angular/core';
import { List } from '../../../modules/list/model/list';
import { Inventory } from '../../../model/other/inventory';
import { BehaviorSubject, combineLatest, Observable, ReplaySubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { NzMessageService } from 'ng-zorro-antd/message';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-inventory-view',
  templateUrl: './inventory-view.component.html',
  styleUrls: ['./inventory-view.component.less']
})
export class InventoryViewComponent {

  public display$: Observable<{ id: number, icon: number, amount: number }[][]>;
  public showFinalItems$ = new BehaviorSubject<boolean>(localStorage.getItem('inventory-view:show-final') !== 'false');
  private list$: ReplaySubject<List> = new ReplaySubject<List>();

  public constructor(private messageService: NzMessageService, private translate: TranslateService) {
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
