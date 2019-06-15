import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState } from './auth.reducer';
import { Character, CharacterResponse } from '@xivapi/angular-client';

// Lookup the 'Auth' feature state managed by NgRx
const getAuthState = createFeatureSelector<AuthState>('auth');

const getLoaded = createSelector(
  getAuthState,
  (state: AuthState) => !state.loading
);

const getCharacters = createSelector(
  getAuthState,
  (state: AuthState) => {
    if (state.characters.find(c => c.Character === null)) {
      console.error(`Ghost character detected: user ${state.uid}`);
    }
    return state.characters.filter(c => c.Character !== null);
  }
);

const getMainCharacter = createSelector(
  getAuthState,
  getCharacters,
  (state: AuthState, characters: CharacterResponse[]) => {
    const character = characters
      .filter(c => c.Character !== null)
      .find(char => char.Character.ID === state.user.defaultLodestoneId);
    // If we couldn't find it, it's maybe because it's a custom one (for KR servers)
    if (character === undefined && state.user !== null) {
      const custom = <Character>state.user.customCharacters.find(c => c.ID === state.user.defaultLodestoneId);
      return custom ? custom : null;
    }
    return character ? character.Character : null;
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
