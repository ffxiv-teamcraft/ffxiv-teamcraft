import { Component, Input } from '@angular/core';
import { List } from '../../../modules/list/model/list';
import { Inventory } from '../../../model/other/inventory';
import { BehaviorSubject, Observable, ReplaySubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { combineLatest } from 'rxjs/internal/observable/combineLatest';

@Component({
  selector: 'app-inventory-view',
  templateUrl: './inventory-view.component.html',
  styleUrls: ['./inventory-view.component.less']
})
export class InventoryViewComponent {

  @Input()
  public set list(l: List) {
    this.list$.next(l);
  }

  private list$: ReplaySubject<List> = new ReplaySubject<List>();

  public display$: Observable<{ id: number, icon: number, amount: number }[][]>;

  public showFinalItems$ = new BehaviorSubject<boolean>(true);

  public constructor() {
    this.display$ = combineLatest(this.list$, this.showFinalItems$).pipe(
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

}
