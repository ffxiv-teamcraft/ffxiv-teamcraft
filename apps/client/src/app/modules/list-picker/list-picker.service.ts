import { Injectable } from '@angular/core';
import { NzDrawerService } from 'ng-zorro-antd';
import { List } from '../list/model/list';
import { Observable } from 'rxjs';
import { ListPickerDrawerComponent } from './list-picker-drawer/list-picker-drawer.component';
import { filter } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class ListPickerService {

  constructor(private nzDrawer: NzDrawerService, private translate: TranslateService) {
  }

  pickList(): Observable<List> {
    return this.nzDrawer.create<ListPickerDrawerComponent, null, List>({
      nzTitle: this.translate.instant('Pick_a_list'),
      nzContent: ListPickerDrawerComponent
    })
      .afterClose
      .pipe(filter(list => list !== null));
  }
}
