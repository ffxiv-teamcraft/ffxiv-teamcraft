import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { List } from '../../list/model/list';
import { ListsFacade } from '../../list/+state/lists.facade';
import { NzDrawerRef } from 'ng-zorro-antd';

@Component({
  selector: 'app-list-picker-drawer',
  templateUrl: './list-picker-drawer.component.html',
  styleUrls: ['./list-picker-drawer.component.less']
})
export class ListPickerDrawerComponent {

  myLists$: Observable<List[]>;

  constructor(private listsFacade: ListsFacade, private drawerRef: NzDrawerRef<List>) {
    this.myLists$ = this.listsFacade.myLists$;

    this.listsFacade.loadMyLists();
  }

  pickList(list: List): void {
    this.drawerRef.close(list);
  }

  pickNewList(): void {
    this.listsFacade.newList().subscribe(list => {
      this.drawerRef.close(list);
    });
  }

}
