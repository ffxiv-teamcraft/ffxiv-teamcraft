import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState } from './auth.reducer';

// Lookup the 'Auth' feature state managed by NgRx
const getAuthState = createFeatureSelector<AuthState>('auth');

const getLoaded = createSelector(
  getAuthState,
  (state: AuthState) => !state.loading
);

const getMainCharacter = createSelector(
  getAuthState,
  (state: AuthState) => {
    const character = state.characters.find(char => char.Character.ID === state.user.defaultLodestoneId);
    return character ? character.Character : null;
  }
);

const getLoggedIn = createSelector(
  getAuthState,
  (state: AuthState) => state.loggedIn
);

export const authQuery = {
  getLoaded,
  getMainCharacter,
  getLoggedIn
};
