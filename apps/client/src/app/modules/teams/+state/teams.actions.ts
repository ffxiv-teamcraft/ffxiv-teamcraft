import { Action } from '@ngrx/store';
import { Team } from '../../../model/team/team';

export enum TeamsActionTypes {
  LoadMyTeams = '[Teams] Load My Teams',
  MyTeamsLoaded = '[Teams] My Teams Loaded',

  LoadTeam = '[Teams] Load Team',
  TeamLoaded = '[Teams] Team Loaded',

  SelectTeam = '[Teams] Select Team',
  CreateTeam = '[Teams] Create Team',
  UpdateTeam = '[Teams] Update Team',
  DeleteTeam = '[Teams] Delete Team',
}

export class LoadMyTeams implements Action {
  readonly type = TeamsActionTypes.LoadMyTeams;
}

export class LoadTeam implements Action {
  readonly type = TeamsActionTypes.LoadTeam;

  constructor(public readonly payload: string) {
  }
}

export class TeamLoaded implements Action {
  readonly type = TeamsActionTypes.TeamLoaded;

  constructor(public readonly payload: Team) {
  }
}

export class MyTeamsLoaded implements Action {
  readonly type = TeamsActionTypes.MyTeamsLoaded;

  constructor(public payload: Team[], public userId: string) {
  }
}

export class SelectTeam implements Action {
  readonly type = TeamsActionTypes.SelectTeam;

  constructor(public payload: string) {
  }
}

export class CreateTeam implements Action {
  readonly type = TeamsActionTypes.CreateTeam;

  constructor(public payload: Team) {
  }
}

export class UpdateTeam implements Action {
  readonly type = TeamsActionTypes.UpdateTeam;

  constructor(public key: string, public payload: Team) {
  }
}

export class DeleteTeam implements Action {
  readonly type = TeamsActionTypes.DeleteTeam;

  constructor(public payload: string) {
  }
}

export type TeamsAction = LoadMyTeams | LoadTeam | TeamLoaded | MyTeamsLoaded | SelectTeam | CreateTeam | UpdateTeam | DeleteTeam;
