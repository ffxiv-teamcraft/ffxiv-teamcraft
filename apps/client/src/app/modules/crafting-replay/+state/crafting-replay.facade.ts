import { Injectable } from '@angular/core';

import { select, Store } from '@ngrx/store';

import * as fromCraftingReplay from './crafting-replay.reducer';
import * as CraftingReplaySelectors from './crafting-replay.selectors';
import { CraftingReplay } from '../model/crafting-replay';
import {
  addCraftingReplay,
  clearOfflineReplays,
  deleteCraftingReplay,
  loadCraftingReplay,
  loadCraftingReplays,
  persistCraftingReplay,
  selectCraftingReplay
} from './crafting-replay.actions';
import { AuthFacade } from '../../../+state/auth.facade';
import { map, switchMap } from 'rxjs/operators';

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

  userCraftingReplays$ = this.authFacade.userId$.pipe(
    switchMap(userId => {
      return this.allCraftingReplays$.pipe(
        map(replays => {
          return replays.filter(replay => !replay.online || replay.authorId === userId);
        })
      );
    })
  );

  selectedCraftingReplay$ = this.store.pipe(
    select(CraftingReplaySelectors.getSelected)
  );

  constructor(
    private store: Store<fromCraftingReplay.CraftingReplayPartialState>,
    private authFacade: AuthFacade
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

  public selectReplay(key: string): void {
    this.store.dispatch(selectCraftingReplay({ key: key }));
  }

  public loadReplay(key: string): void {
    this.store.dispatch(loadCraftingReplay({ key: key }));
  }

  public deleteReplay(key: string): void {
    this.store.dispatch(deleteCraftingReplay({ key: key }));
  }

  clearOfflineReplays(): void {
    this.store.dispatch(clearOfflineReplays());
  }
}
