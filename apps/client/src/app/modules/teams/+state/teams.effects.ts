import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { CreateTeam, DeleteTeam, LoadMyTeams, LoadTeam, MyTeamsLoaded, TeamLoaded, TeamsActionTypes, UpdateTeam } from './teams.actions';
import { AuthFacade } from '../../../+state/auth.facade';
import { catchError, distinctUntilChanged, exhaustMap, filter, map, switchMap, withLatestFrom } from 'rxjs/operators';
import { TeamService } from '../../../core/database/team.service';
import { of } from 'rxjs';
import { Team } from '../../../model/team/team';
import { TeamsFacade } from './teams.facade';

@Injectable()
export class TeamsEffects {


  loadMyTeams$ = createEffect(() => this.actions$.pipe(
    ofType<LoadMyTeams>(TeamsActionTypes.LoadMyTeams),
    exhaustMap(() => this.authFacade.userId$),
    distinctUntilChanged(),
    switchMap((uid) => this.teamService.getUserTeams(uid).pipe(
      map(teams => new MyTeamsLoaded(teams.filter(t => t.members[0] !== '0'), uid))
    ))
  ));


  loadTeam$ = createEffect(() => this.actions$.pipe(
    ofType<LoadTeam>(TeamsActionTypes.LoadTeam),
    withLatestFrom(this.teamsFacade.allTeams$),
    filter(([action, allTeams]) => {
      return !allTeams.some(team => team.$key === action.payload);
    }),
    switchMap(([action]) => {
      return this.teamService.get(action.payload).pipe(
        catchError(() => of({ $key: action.payload, notFound: true }))
      );
    }),
    map(team => new TeamLoaded(<Team>team))
  ));


  createTeamInDatabase$ = createEffect(() => this.actions$.pipe(
    ofType<CreateTeam>(TeamsActionTypes.CreateTeam),
    withLatestFrom(this.authFacade.userId$),
    switchMap(([action, userId]) => {
      action.payload.leader = userId;
      action.payload.members.push(userId);
      return this.teamService.add(action.payload);
    })
  ), { dispatch: false });


  updateTeamInDatabase$ = createEffect(() => this.actions$.pipe(
    ofType<UpdateTeam>(TeamsActionTypes.UpdateTeam),
    switchMap(action => this.teamService.set(action.payload.$key, action.payload))
  ), { dispatch: false });


  deleteTeamFromDatabase$ = createEffect(() => this.actions$.pipe(
    ofType<DeleteTeam>(TeamsActionTypes.DeleteTeam),
    switchMap(action => this.teamService.remove(action.payload))
  ), { dispatch: false });

  constructor(
    private actions$: Actions,
    private authFacade: AuthFacade,
    private teamService: TeamService,
    private teamsFacade: TeamsFacade
  ) {
  }
}
