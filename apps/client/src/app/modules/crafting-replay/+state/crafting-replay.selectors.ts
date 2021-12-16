import { createFeatureSelector, createSelector } from '@ngrx/store';
import {
  CRAFTINGREPLAY_FEATURE_KEY,
  State,
  CraftingReplayPartialState,
  craftingReplayAdapter
} from './crafting-replay.reducer';

// Lookup the 'CraftingReplay' feature state managed by NgRx
export const getCraftingReplayState = createFeatureSelector<CraftingReplayPartialState,
  State>(CRAFTINGREPLAY_FEATURE_KEY);

const { selectAll, selectEntities } = craftingReplayAdapter.getSelectors();

export const getCraftingReplayLoaded = createSelector(
  getCraftingReplayState,
  (state: State) => state.loaded
);

export const getAllCraftingReplays = createSelector(
  getCraftingReplayState,
  (state: State) => selectAll(state)
);

export const getCraftingReplayEntities = createSelector(
  getCraftingReplayState,
  (state: State) => selectEntities(state)
);

export const getSelectedId = createSelector(
  getCraftingReplayState,
  (state: State) => state.selectedId
);

export const getSelected = createSelector(
  getCraftingReplayEntities,
  getSelectedId,
  (entities, selectedId) => selectedId && entities[selectedId]
);
