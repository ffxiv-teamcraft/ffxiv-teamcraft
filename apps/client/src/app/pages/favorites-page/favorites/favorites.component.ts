import { Component } from '@angular/core';
import { WorkshopDisplay } from '../../../model/other/workshop-display';
import { Observable } from 'rxjs/Observable';
import { List } from '../../../modules/list/model/list';
import { AuthFacade } from '../../../+state/auth.facade';
import { debounceTime, filter, map, switchMap, tap } from 'rxjs/operators';
import { ListsFacade } from '../../../modules/list/+state/lists.facade';
import { combineLatest } from 'rxjs/internal/observable/combineLatest';
import { WorkshopsFacade } from '../../../modules/workshop/+state/workshops.facade';

@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.less']
})
export class FavoritesComponent {

  public workshops$: Observable<WorkshopDisplay[]>;

  public lists$: Observable<List[]>;

  constructor(private authFacade: AuthFacade, private listsFacade: ListsFacade, private workshopsFacade: WorkshopsFacade) {
    this.lists$ = this.authFacade.favorites$.pipe(
      map(favorites => favorites.lists),
      tap(lists => lists.forEach(list => this.listsFacade.loadCompact(list))),
      switchMap(lists => {
        return this.listsFacade.compacts$.pipe(
          map(compacts => compacts.filter(c => lists.indexOf(c.$key) > -1)),
          filter(compacts => compacts.length === lists.length)
        );
      })
    );

    const favoriteWorkshops$ = this.authFacade.favorites$.pipe(
      map(favorites => favorites.workshops),
      tap(workshops => workshops.forEach(workshop => this.workshopsFacade.loadWorkshop(workshop))),
      switchMap(workshops => {
        return this.workshopsFacade.allWorkshops$.pipe(
          map(ws => ws.filter(w => workshops.indexOf(w.$key) > -1)),
          filter(ws => ws.length === workshops.length),
          tap(ws => ws.forEach(w => w.listIds.forEach(listId => this.listsFacade.loadCompact(listId))))
        );
      })
    );

    this.workshops$ = combineLatest(favoriteWorkshops$, this.listsFacade.compacts$).pipe(
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
          });
      })
    );
  }

}
