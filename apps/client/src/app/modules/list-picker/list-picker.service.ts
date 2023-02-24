import { Injectable } from '@angular/core';
import { NzDrawerService } from 'ng-zorro-antd/drawer';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { List } from '../list/model/list';
import { combineLatest, concat, Observable, of, race, Subject } from 'rxjs';
import { ListPickerDrawerComponent } from './list-picker-drawer/list-picker-drawer.component';
import { delay, filter, first, map, mergeMap, switchMap, tap } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { ListsFacade } from '../list/+state/lists.facade';
import { ListRow } from '../list/model/list-row';
import { ListManagerService } from '../list/list-manager.service';
import { ProgressPopupService } from '../progress-popup/progress-popup.service';
import { Router } from '@angular/router';
import { ListAdditionRecord } from './list-addition-record';

@Injectable({
  providedIn: 'root'
})
export class ListPickerService {

  constructor(private nzDrawer: NzDrawerService, private translate: TranslateService,
              private listsFacade: ListsFacade, private listManager: ListManagerService,
              private progressService: ProgressPopupService, private notificationService: NzNotificationService,
              private router: Router) {
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

  addToList(...items: ListAdditionRecord[]): Observable<List> {
    // Making the observable optional, this way you can just call it and ignore it,
    // or add your own logic once it's done.
    const done$ = new Subject<List>();
    this.pickList().pipe(
      switchMap(list => {
        const operations = items.map(item => {
          return this.listManager.addToList({
            itemId: +item.id,
            list: list,
            recipeId: item.recipeId || '',
            amount: item.amount,
            collectable: item.collectable
          });
        });
        let operation$: Observable<any>;
        if (operations.length > 0) {
          operation$ = concat(
            ...operations
          );
        } else {
          operation$ = of(list);
        }
        return this.progressService.showProgress(operation$,
          items.length,
          'Adding_recipes',
          { amount: items.length, listname: list.name });
      }),
      tap(list => list.$key ? this.listsFacade.updateList(list) : this.listsFacade.addList(list)),
      switchMap(list => {
        // We want to get the list created before calling it a success, let's be pessimistic !
        return this.progressService.showProgress(
          combineLatest([this.listsFacade.myLists$, this.listsFacade.listsWithWriteAccess$]).pipe(
            map(([myLists, listsICanWrite]) => [...myLists, ...listsICanWrite]),
            map(lists => lists.find(l => l.createdAt.seconds === list.createdAt.seconds)),
            filter(l => l !== undefined),
            first()
          ), 1, 'Saving_in_database');
      }),
      switchMap(list => {
        done$.next(list);
        done$.complete();
        const ref = this.notificationService.success(
          this.translate.instant('Success'),
          this.translate.instant('Recipes_Added', { listname: list.name, itemcount: items.length }),
          {
            nzStyle: {
              cursor: 'pointer'
            }
          }
        );
        return race(
          ref.onClick.pipe(delay(100),map(() => list)),
          ref.onClose.pipe(map(() => false))
        );
      })
    ).subscribe((list) => {
      if (list) {
        this.router.navigate(['/list', list.$key]);
      }
    });
    return done$;
  }
}
