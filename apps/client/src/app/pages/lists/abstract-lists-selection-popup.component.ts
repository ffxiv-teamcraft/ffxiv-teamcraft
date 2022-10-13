import { Component, OnInit } from '@angular/core';
import { combineLatest, Observable } from 'rxjs';
import { debounceTime, map } from 'rxjs/operators';
import { List } from '../../modules/list/model/list';
import { WorkshopDisplay } from '../../model/other/workshop-display';
import { ListsFacade } from '../../modules/list/+state/lists.facade';
import { WorkshopsFacade } from '../../modules/workshop/+state/workshops.facade';

@Component({
  template: ''
})
// tslint:disable-next-line:component-class-suffix
export abstract class AbstractListsSelectionPopupComponent implements OnInit {

  lists$: Observable<List[]>;

  workshops$: Observable<WorkshopDisplay[]>;

  selectedLists: List[] = [];

  protected constructor(protected listsFacade: ListsFacade, protected workshopsFacade: WorkshopsFacade) {
  }

  public setSelection(list: List, selected: boolean): void {
    if (selected) {
      this.selectedLists.push(list);
    } else {
      this.selectedLists = this.selectedLists.filter(l => l.$key !== list.$key);
    }
  }

  ngOnInit(): void {
    this.workshops$ = combineLatest([this.workshopsFacade.myWorkshops$, this.listsFacade.allListDetails$]).pipe(
      debounceTime(100),
      map(([workshops, lists]) => {
        return workshops
          .map(workshop => {
            return {
              workshop: workshop,
              lists: workshop.listIds
                .map(key => {
                  const list = lists.find(c => c.$key === key);
                  if (list !== undefined) {
                    list.workshopId = workshop.$key;
                  }
                  return list;
                })
                .filter(l => l !== undefined && l.name)
            };
          })
          .filter(display => display.lists.length > 0)
          .sort((a, b) => a.workshop.index - b.workshop.index);
      })
    );
    this.lists$ = combineLatest([this.listsFacade.myLists$, this.workshops$]).pipe(
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
        return lists.sort((a, b) => a.index - b.index);
      })
    );
  }
}
