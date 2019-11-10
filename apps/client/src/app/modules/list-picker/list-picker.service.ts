import { Injectable } from '@angular/core';
import { NzDrawerService } from 'ng-zorro-antd';
import { List } from '../list/model/list';
import { Observable, of } from 'rxjs';
import { ListPickerDrawerComponent } from './list-picker-drawer/list-picker-drawer.component';
import { filter, first, map, mergeMap, tap } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { ListsFacade } from '../list/+state/lists.facade';

@Injectable({
  providedIn: 'root'
})
export class ListPickerService {

  constructor(private nzDrawer: NzDrawerService, private translate: TranslateService,
              private listsFacade: ListsFacade) {
  }

  pickList(workshopView = false): Observable<List> {
    return this.nzDrawer.create<ListPickerDrawerComponent, Partial<ListPickerDrawerComponent>, List>({
      nzTitle: this.translate.instant('Pick_a_list'),
      nzContent: ListPickerDrawerComponent,
      nzContentParams: {
        workshopView: workshopView
      }
    })
      .afterClose
      .pipe(
        filter(list => list !== null && list !== undefined),
        mergeMap(list => {
          // If this isn't a new list, wait for it to be loaded;
          if (list.$key) {
            return this.listsFacade.allListDetails$.pipe(
              map(data => data.find(l => l.$key === list.$key)),
              filter(resultList => resultList !== undefined),
              first()
            );
          }
          // else, just return the list
          return of(list);
        }),
        filter(list => list !== undefined)
      );
  }
}
