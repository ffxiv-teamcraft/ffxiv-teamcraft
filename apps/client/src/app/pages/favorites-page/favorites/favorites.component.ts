import { Component } from '@angular/core';
import { WorkshopDisplay } from '../../../model/other/workshop-display';
import { combineLatest, Observable } from 'rxjs';
import { List } from '../../../modules/list/model/list';
import { AuthFacade } from '../../../+state/auth.facade';
import { debounceTime, distinctUntilChanged, filter, map, mergeMap, tap } from 'rxjs/operators';
import { ListsFacade } from '../../../modules/list/+state/lists.facade';
import { WorkshopsFacade } from '../../../modules/workshop/+state/workshops.facade';
import { CraftingRotation } from '../../../model/other/crafting-rotation';
import { RotationsFacade } from '../../../modules/rotations/+state/rotations.facade';
import { CraftingRotationsFolder } from '../../../model/other/crafting-rotations-folder';
import { RotationFoldersFacade } from '../../../modules/rotation-folders/+state/rotation-folders.facade';

@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.less']
})
export class FavoritesComponent {

  public workshops$: Observable<WorkshopDisplay[]>;

  public lists$: Observable<List[]>;

  public rotations$: Observable<CraftingRotation[]>;

  public rotationFolders$: Observable<{ folder: CraftingRotationsFolder, rotations: CraftingRotation[] }[]>;

  constructor(private authFacade: AuthFacade, private listsFacade: ListsFacade, private workshopsFacade: WorkshopsFacade,
              private rotationsFacade: RotationsFacade, private rotationFoldersFacade: RotationFoldersFacade) {
    this.lists$ = this.authFacade.favorites$.pipe(
      map(favorites => (favorites.lists || [])),
      tap(lists => lists.forEach(list => this.listsFacade.load(list))),
      mergeMap(lists => {
        return this.listsFacade.allListDetails$.pipe(
          map(details => details.filter(c => lists.indexOf(c.$key) > -1 && !c.notFound))
        );
      })
    );

    this.rotations$ = this.authFacade.favorites$.pipe(
      distinctUntilChanged((a, b) => JSON.stringify(a.rotations) === JSON.stringify(b.rotations)),
      map(favorites => (favorites.rotations || [])),
      tap(rotations => rotations.forEach(rotation => this.rotationsFacade.getRotation(rotation))),
      mergeMap(rotations => {
        return this.rotationsFacade.allRotations$.pipe(
          map(loadedRotations => loadedRotations.filter(r => rotations.indexOf(r.$key) > -1 && !r.notFound))
        );
      })
    );

    const favoriteWorkshops$ = this.authFacade.favorites$.pipe(
      map(favorites => (favorites.workshops || [])),
      tap(workshops => workshops.forEach(workshop => this.workshopsFacade.loadWorkshop(workshop))),
      mergeMap(workshops => {
        return this.workshopsFacade.allWorkshops$.pipe(
          map(ws => ws.filter(w => workshops.indexOf(w.$key) > -1)),
          filter(ws => ws.length === workshops.length),
          tap(ws => (ws || []).forEach(w => (w.listIds || []).forEach(listId => this.listsFacade.load(listId))))
        );
      })
    );

    this.workshops$ = combineLatest([favoriteWorkshops$, this.listsFacade.allListDetails$]).pipe(
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

    this.rotationFolders$ = this.rotationFoldersFacade.favoriteRotationFolders$;
  }

}
