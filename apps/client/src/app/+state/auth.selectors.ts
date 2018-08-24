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
  (state: AuthState) => state.characters.find(char => char.Payload.ID === state.user.defaultLodestoneId).Payload
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
