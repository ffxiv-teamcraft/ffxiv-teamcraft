import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState } from './auth.reducer';
import { Character } from '@xivapi/angular-client';

// Lookup the 'Auth' feature state managed by NgRx
const getAuthState = createFeatureSelector<AuthState>('auth');

const getLoaded = createSelector(
  getAuthState,
  (state: AuthState) => !state.loading
);

const getMainCharacter = createSelector(
  getAuthState,
  (state: AuthState) => {
    let character = state.characters.find(char => char.Character.ID === state.user.defaultLodestoneId);
    // If we couldn't find it, it's maybe because it's a custom one (for KR servers)
    if (character === undefined && state.user !== null) {
      const custom = <Character>state.user.customCharacters.find(c => c.ID === state.user.defaultLodestoneId);
      return custom? custom : null;
    }
    return character ? character.Character : null;
  }
);

const getCharacters = createSelector(
  getAuthState,
  (state: AuthState) => {
    return state.characters;
  }
);

const getLoggedIn = createSelector(
  getAuthState,
  (state: AuthState) => state.loggedIn
);

const getLinkingCharacter = createSelector(
  getAuthState,
  (state: AuthState) => state.linkingCharacter
);

const getUserId = createSelector(
  getAuthState,
  (state: AuthState) => state.uid
);

const getUser = createSelector(
  getAuthState,
  (state: AuthState) => state.user
);

export const authQuery = {
  getLoaded,
  getMainCharacter,
  getLinkingCharacter,
  getLoggedIn,
  getUser,
  getUserId,
  getCharacters
};
