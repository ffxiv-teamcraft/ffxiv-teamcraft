import { Injectable } from '@angular/core';

import { Store } from '@ngrx/store';

import { TeamsState } from './teams.reducer';
import { teamsQuery } from './teams.selectors';
import { CreateTeam, DeleteTeam, LoadMyTeams, LoadTeam, SelectTeam, UpdateTeam } from './teams.actions';
import { AuthFacade } from '../../../+state/auth.facade';
import { combineLatest, Observable } from 'rxjs';
import { map, shareReplay, tap } from 'rxjs/operators';
import { Team } from '../../../model/team/team';
import { TeamInviteService } from '../../../core/database/team-invite.service';
import { TeamInvite } from '../../../model/team/team-invite';

@Injectable({
  providedIn: 'root'
})
export class TeamsFacade {
  loading$ = this.store.select(teamsQuery.getLoaded).pipe(map(loaded => !loaded));

  allTeams$ = this.store.select(teamsQuery.getAllTeams);

  selectedTeam$ = this.store.select(teamsQuery.getSelectedTeam);

  myTeams$ = combineLatest([this.allTeams$, this.authFacade.userId$]).pipe(
    map(([teams, userId]) => {
      return teams.filter(team => !team.notFound && team.members.indexOf(userId) > -1);
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  constructor(private store: Store<{ teams: TeamsState }>, private authFacade: AuthFacade, private teamInviteService: TeamInviteService) {
  }

  createTeamInvite(team: Team, infinite = false): void {
    const invite = new TeamInvite();
    invite.teamId = team.$key;
    if (!infinite) {
      const expires = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
      invite.expires = expires.toISOString();
    }
    this.teamInviteService.add(invite).subscribe();
  }

  getTeamInvites(team: Team): Observable<TeamInvite[]> {
    return this.teamInviteService.getByForeignKey(Team, team.$key).pipe(
      tap(invites => {
        invites
          .filter(i => i.expires !== undefined && new Date(i.expires).getTime() <= new Date().getTime())
          .forEach(invite => {
            this.removeTeamInvite(invite.$key);
          });
      }),
      map(invites => {
        return invites.filter(i => i.expires === undefined || new Date(i.expires).getTime() > new Date().getTime());
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }

  removeTeamInvite(key: string): void {
    this.teamInviteService.remove(key);
  }

  createTeam(team: Team): void {
    this.store.dispatch(new CreateTeam(team));
  }

  updateTeam(team: Team): void {
    this.store.dispatch(new UpdateTeam(team.$key, team));
  }

  deleteTeam(key: string): void {
    this.store.dispatch(new DeleteTeam(key));
  }

  select(key: string): void {
    this.store.dispatch(new SelectTeam(key));
  }

  loadTeam(key: string): void {
    this.store.dispatch(new LoadTeam(key));
  }

  loadMyTeams() {
    this.store.dispatch(new LoadMyTeams());
  }
}
