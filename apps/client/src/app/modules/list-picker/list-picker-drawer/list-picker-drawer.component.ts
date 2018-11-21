import { Component } from '@angular/core';
import { combineLatest, Observable, of } from 'rxjs';
import { List } from '../../list/model/list';
import { ListsFacade } from '../../list/+state/lists.facade';
import { NzDrawerRef } from 'ng-zorro-antd';
import { WorkshopDisplay } from '../../../model/other/workshop-display';
import { debounceTime, map } from 'rxjs/operators';
import { WorkshopsFacade } from '../../workshop/+state/workshops.facade';

@Component({
  selector: 'app-list-picker-drawer',
  templateUrl: './list-picker-drawer.component.html',
  styleUrls: ['./list-picker-drawer.component.less']
})
export class ListPickerDrawerComponent {

  myLists$: Observable<List[]>;

  listsWithWriteAccess$: Observable<List[]>;

  workshops$: Observable<WorkshopDisplay[]>;

  constructor(private listsFacade: ListsFacade, private drawerRef: NzDrawerRef<List>, private workshopsFacade: WorkshopsFacade) {

    this.listsWithWriteAccess$ = this.listsFacade.listsWithWriteAccess$;

    this.workshops$ = combineLatest(this.workshopsFacade.myWorkshops$, this.listsFacade.compacts$).pipe(
      debounceTime(100),
      map(([workshops, compacts]) => {
        return workshops
          .map(workshop => {
            return {
              workshop: workshop,
              lists: workshop.listIds
                .map(key => {
                  const list = compacts.find(c => c.$key === key);
                  if (list !== undefined) {
                    list.workshopId = workshop.$key;
                  }
                  return list;
                })
                .filter(l => l !== undefined)
            };
          })
          .filter(display => display.lists.length > 0)
          .sort((a, b) => a.workshop.index - b.workshop.index);
      })
    );

    this.myLists$ = combineLatest(this.listsFacade.myLists$, this.workshops$).pipe(
      debounceTime(100),
      map(([lists, workshops]) => {
        // lists category shows only lists that have no workshop.
        return lists
          .filter(l => {
            return workshops.find(w => w.workshop.listIds.indexOf(l.$key) > -1) === undefined;
          })
          .map(l => {
            delete l.workshopId;
            return l;
          });
      }),
      map(lists => {
        return lists.sort((a, b) => b.index - a.index);
      })
    );

    this.listsFacade.loadMyLists();
    this.listsFacade.loadListsWithWriteAccess();
  }

  trackByWorkshopDisplay(index: number, workshopDisplay: WorkshopDisplay): string {
    return workshopDisplay.workshop.$key;
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
