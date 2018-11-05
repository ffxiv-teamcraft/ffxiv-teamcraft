import { createFeatureSelector, createSelector } from '@ngrx/store';
import { TeamsState } from './teams.reducer';

// Lookup the 'Teams' feature state managed by NgRx
const getTeamsState = createFeatureSelector<TeamsState>('teams');

const getLoaded = createSelector(
  getTeamsState,
  (state: TeamsState) => state.loaded
);

const getAllTeams = createSelector(
  getTeamsState,
  getLoaded,
  (state: TeamsState, isLoaded) => {
    return isLoaded ? state.teams : [];
  }
);
const getSelectedId = createSelector(
  getTeamsState,
  (state: TeamsState) => state.selectedId
);
const getSelectedTeam = createSelector(
  getAllTeams,
  getSelectedId,
  (teams, key) => {
    return teams.find(it => it['$key'] === key);
  }
);

export const teamsQuery = {
  getLoaded,
  getAllTeams,
  getSelectedTeam
};
