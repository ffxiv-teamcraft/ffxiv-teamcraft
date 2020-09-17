import { Action, createReducer, on } from '@ngrx/store';
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';

import * as CraftingReplayActions from './crafting-replay.actions';
import { CraftingReplay } from '../model/crafting-replay';

export const CRAFTINGREPLAY_FEATURE_KEY = 'craftingReplay';

export interface State extends EntityState<CraftingReplay> {
  selectedId?: string; // which CraftingReplay record has been selected
  loaded: boolean; // has the CraftingReplay list been loaded
}

export interface CraftingReplayPartialState {
  readonly [CRAFTINGREPLAY_FEATURE_KEY]: State;
}

export const craftingReplayAdapter: EntityAdapter<CraftingReplay> = createEntityAdapter<CraftingReplay>({
  selectId: e => e.$key,
  sortComparer: (a, b) => {
    return b.startTime.seconds - a.startTime.seconds;
  }
});

export const initialState: State = craftingReplayAdapter.getInitialState({
  // set initial required properties
  loaded: false
});

const craftingReplayReducer = createReducer(
  initialState,
  on(CraftingReplayActions.loadCraftingReplays, (state) => ({
    ...state,
    loaded: false
  })),
  on(
    CraftingReplayActions.loadCraftingReplaysSuccess,
    (state, { craftingReplays }) =>
      craftingReplayAdapter.setAll(craftingReplays, { ...state, loaded: true })
  ),
  on(
    CraftingReplayActions.addHashedCraftingReplay,
    (state, { craftingReplay }) =>
      craftingReplayAdapter.setOne(craftingReplay, { ...state })
  ),
  on(
    CraftingReplayActions.deleteCraftingReplay,
    (state, { key }) =>
      craftingReplayAdapter.removeOne(key, { ...state })
  ),
  on(
    CraftingReplayActions.craftingReplayLoaded,
    (state, { craftingReplay }) =>
      craftingReplayAdapter.setOne(craftingReplay, { ...state })
  ),
  on(
    CraftingReplayActions.selectCraftingReplay,
    (state, { key }) =>
      ({
        ...state,
        selectedId: key
      })
  )
);

export function reducer(state: State | undefined, action: Action) {
  return craftingReplayReducer(state, action);
}
