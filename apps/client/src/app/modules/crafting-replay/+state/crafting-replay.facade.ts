import { Injectable } from '@angular/core';

import { select, Store } from '@ngrx/store';

import * as fromCraftingReplay from './crafting-replay.reducer';
import * as CraftingReplaySelectors from './crafting-replay.selectors';
import { CraftingReplay } from '../model/crafting-replay';
import { addCraftingReplay, deleteCraftingReplay, loadCraftingReplays, persistCraftingReplay } from './crafting-replay.actions';

@Injectable({
  providedIn: 'root'
})
export class CraftingReplayFacade {

  loaded$ = this.store.pipe(
    select(CraftingReplaySelectors.getCraftingReplayLoaded)
  );

  allCraftingReplays$ = this.store.pipe(
    select(CraftingReplaySelectors.getAllCraftingReplays)
  );

  selectedCraftingReplay$ = this.store.pipe(
    select(CraftingReplaySelectors.getSelected)
  );

  constructor(
    private store: Store<fromCraftingReplay.CraftingReplayPartialState>
  ) {
  }

  loadAll(): void {
    this.store.dispatch(loadCraftingReplays());
  }

  /**
   * adds the replay to the local storage system
   * @param replay
   */
  public addReplay(replay: CraftingReplay): void {
    this.store.dispatch(addCraftingReplay({ craftingReplay: replay }));
  }

  /**
   * Persist an existing replay inside database
   * @param replay
   */
  public saveReplay(replay: CraftingReplay): void {
    this.store.dispatch(persistCraftingReplay({ craftingReplay: replay }));
  }

  public deleteReplay(key: string): void {
    this.store.dispatch(deleteCraftingReplay({ key: key }));
  }
}
