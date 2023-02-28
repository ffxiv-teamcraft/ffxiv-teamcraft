import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { getSelectedTrain } from './fish-train.selectors';
import { loadFishTrain, selectFishTrain } from './fish-train.actions';

@Injectable({
  providedIn: 'root'
})
export class FishTrainFacade {

  selectedFishTrain$ = this.store.pipe(
    select(getSelectedTrain)
  );

  constructor(private store: Store) {
  }

  load(id: string): void {
    this.store.dispatch(loadFishTrain({ id }));
  }

  select(id: string): void {
    this.store.dispatch(selectFishTrain({ id }));
  }
}
