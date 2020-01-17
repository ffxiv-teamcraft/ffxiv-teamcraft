import { Injectable } from '@angular/core';

import { select, Store } from '@ngrx/store';

import { GearsetsPartialState } from './gearsets.reducer';
import { gearsetsQuery } from './gearsets.selectors';
import { CreateGearset, DeleteGearset, LoadGearset, LoadGearsets, SelectGearset, UpdateGearset } from './gearsets.actions';
import { map, switchMap } from 'rxjs/operators';
import { AuthFacade } from '../../../+state/auth.facade';
import { TeamcraftGearset } from '../../../model/gearset/teamcraft-gearset';

@Injectable({
  providedIn: 'root'
})
export class GearsetsFacade {
  loaded$ = this.store.pipe(select(gearsetsQuery.getLoaded));

  allGearsets$ = this.store.pipe(select(gearsetsQuery.getAllGearsets));

  selectedGearset$ = this.store.pipe(
    select(gearsetsQuery.getSelectedGearset)
  );

  myGearsets$ = this.allGearsets$.pipe(
    switchMap((gearsets: TeamcraftGearset[]) => {
      return this.authFacade.userId$.pipe(
        map(userId => {
          return gearsets.filter(gearset => {
            return gearset.authorId === userId;
          });
        })
      );
    })
  );

  constructor(private store: Store<GearsetsPartialState>, private authFacade: AuthFacade) {
  }

  loadAll(): void {
    this.store.dispatch(new LoadGearsets());
  }

  load(key: string): void {
    this.store.dispatch(new LoadGearset(key));
  }

  update(key: string, gearset: TeamcraftGearset): void {
    this.store.dispatch(new UpdateGearset(key, gearset));
  }

  delete(key: string): void {
    this.store.dispatch(new DeleteGearset(key));
  }

  select(key: string): void {
    this.store.dispatch(new SelectGearset(key));
  }

  createGearset(): void {
    this.store.dispatch(new CreateGearset());
  }
}
