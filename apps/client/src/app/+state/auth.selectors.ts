import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState } from './auth.reducer';

// Lookup the 'Auth' feature state managed by NgRx
const getAuthState = createFeatureSelector<AuthState>('auth');

const getLoaded = createSelector(
  getAuthState,
  (state: AuthState) => !state.loading
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

const getLogTracking = createSelector(
  getAuthState,
  (state: AuthState) => state.logTracking
);

const getServerLogTracking = createSelector(
  getAuthState,
  (state: AuthState) => state.serverLogTracking
);

export const authQuery = {
  getLoaded,
  getLinkingCharacter,
  getLoggedIn,
  getUser,
  getUserId,
  getLogTracking,
  getServerLogTracking
};
