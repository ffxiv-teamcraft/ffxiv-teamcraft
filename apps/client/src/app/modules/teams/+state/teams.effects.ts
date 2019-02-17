import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { CreateTeam, DeleteTeam, LoadMyTeams, LoadTeam, MyTeamsLoaded, TeamLoaded, TeamsActionTypes, UpdateTeam } from './teams.actions';
import { AuthFacade } from '../../../+state/auth.facade';
import { catchError, filter, map, switchMap, withLatestFrom } from 'rxjs/operators';
import { TeamService } from '../../../core/database/team.service';
import { EMPTY, of } from 'rxjs';
import { Team } from '../../../model/team/team';
import { TeamsFacade } from './teams.facade';

@Injectable()
export class TeamsEffects {

  @Effect()
  loadMyTeams$ = this.actions$.pipe(
    ofType<LoadMyTeams>(TeamsActionTypes.LoadMyTeams),
    switchMap(() => this.authFacade.userId$),
    switchMap((uid) => this.teamService.getUserTeams(uid).pipe(
      map(teams => new MyTeamsLoaded(teams.filter(t => t.members[0] !== '0'), uid))
    ))
  );

  @Effect()
  loadTeam$ = this.actions$.pipe(
    ofType<LoadTeam>(TeamsActionTypes.LoadTeam),
    withLatestFrom(this.teamsFacade.allTeams$),
    filter(([action, allTeams]) => {
      return !allTeams.some(team => team.$key === action.payload);
    }),
    switchMap(([action]) => {
      return this.teamService.get(action.payload).pipe(
        catchError(() => of({$key: action.payload, notFound: true}))
      )
    }),
    map(team => new TeamLoaded(<Team>team))
  );

  @Effect()
  createTeamInDatabase$ = this.actions$.pipe(
    ofType<CreateTeam>(TeamsActionTypes.CreateTeam),
    withLatestFrom(this.authFacade.userId$),
    switchMap(([action, userId]) => {
      action.payload.leader = userId;
      action.payload.members.push(userId);
      return this.teamService.add(action.payload);
    }),
    switchMap(() => EMPTY)
  );

  @Effect()
  updateTeamInDatabase$ = this.actions$.pipe(
    ofType<UpdateTeam>(TeamsActionTypes.UpdateTeam),
    switchMap(action => this.teamService.set(action.payload.$key, action.payload)),
    switchMap(() => EMPTY)
  );

  @Effect()
  deleteTeamFromDatabase$ = this.actions$.pipe(
    ofType<DeleteTeam>(TeamsActionTypes.DeleteTeam),
    switchMap(action => this.teamService.remove(action.payload)),
    switchMap(() => EMPTY)
  );

  constructor(
    private actions$: Actions,
    private authFacade: AuthFacade,
    private teamService: TeamService,
    private teamsFacade: TeamsFacade
  ) {
  }
}
