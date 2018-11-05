import { TeamsAction, TeamsActionTypes } from './teams.actions';
import { Team } from '../../../model/team/team';

export interface TeamsState {
  teams: Team[]; // list of Teams; analogous to a sql normalized table
  selectedId?: string; // which Teams record has been selected
  loaded: boolean; // has the Teams list been loaded
}

export const initialState: TeamsState = {
  teams: [],
  loaded: false
};

export function teamsReducer(
  state: TeamsState = initialState,
  action: TeamsAction
): TeamsState {
  switch (action.type) {
    case TeamsActionTypes.MyTeamsLoaded: {
      state = {
        ...state,
        teams: [
          ...state.teams.filter(team => team && !team.notFound && team.members.indexOf(action.userId) === -1),
          ...action.payload
        ],
        loaded: true
      };
      break;
    }

    case TeamsActionTypes.TeamLoaded: {
      state = {
        ...state,
        teams: [
          ...state.teams.filter(team => team.$key !== action.payload.$key),
          action.payload
        ],
        loaded: true
      };
      break;
    }

    case TeamsActionTypes.UpdateTeam: {
      state = {
        ...state,
        teams: [
          ...state.teams.filter(team => team.$key !== action.payload.$key),
          action.payload
        ]
      };
      break;
    }

    case TeamsActionTypes.DeleteTeam: {
      state = {
        ...state,
        teams: [
          ...state.teams.filter(team => team.$key !== action.payload)
        ]
      };
      break;
    }

    case TeamsActionTypes.SelectTeam: {
      state = {
        ...state,
        selectedId: action.payload
      };
    }
  }
  return state;
}
