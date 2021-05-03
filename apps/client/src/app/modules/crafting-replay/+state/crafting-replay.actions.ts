import { createAction, props } from '@ngrx/store';
import { CraftingReplay } from '../model/crafting-replay';

export const loadCraftingReplays = createAction(
  '[CraftingReplay] Load CraftingReplays'
);

export const clearOfflineReplays = createAction(
  '[CraftingReplay] Clear Offline CraftingReplays'
);

export const loadCraftingReplaysSuccess = createAction(
  '[CraftingReplay] Load CraftingReplays Success',
  props<{ craftingReplays: CraftingReplay[] }>()
);

export const addCraftingReplay = createAction(
  '[CraftingReplay] Add CraftingReplay',
  props<{ craftingReplay: CraftingReplay }>()
);

export const addHashedCraftingReplay = createAction(
  '[CraftingReplay] Add Hashed CraftingReplay',
  props<{ craftingReplay: CraftingReplay }>()
);

export const persistCraftingReplay = createAction(
  '[CraftingReplay] Persist CraftingReplay',
  props<{ craftingReplay: CraftingReplay }>()
);

export const deleteCraftingReplay = createAction(
  '[CraftingReplay] Delete CraftingReplay',
  props<{ key: string }>()
);

export const selectCraftingReplay = createAction(
  '[CraftingReplay] Select CraftingReplay',
  props<{ key: string }>()
);

export const loadCraftingReplay = createAction(
  '[CraftingReplay] Load CraftingReplay',
  props<{ key: string }>()
);

export const craftingReplayLoaded = createAction(
  '[CraftingReplay] CraftingReplay Loaded',
  props<{ craftingReplay: CraftingReplay }>()
);
