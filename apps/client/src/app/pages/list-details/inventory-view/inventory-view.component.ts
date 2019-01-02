import { Component, Input } from '@angular/core';
import { List } from '../../../modules/list/model/list';
import { Inventory } from '../../../model/other/inventory';
import { Observable, ReplaySubject } from 'rxjs';
import { map } from 'rxjs/operators';

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

  public constructor() {
    this.display$ = this.list$.pipe(
      map(list => {
        const inventory = new Inventory();
        list.forEach(item => {
          inventory.add(item.id, item.icon, item.done - item.used);
        });
        return inventory.getDisplay();
      })
    );
  }

}
