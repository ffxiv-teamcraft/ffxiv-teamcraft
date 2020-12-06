import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, filter, first, map, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { TeamsFacade } from '../../../modules/teams/+state/teams.facade';
import { TeamInviteService } from '../../../core/database/team-invite.service';
import { BehaviorSubject, EMPTY, ReplaySubject } from 'rxjs';
import { AuthFacade } from '../../../+state/auth.facade';
import { Team } from '../../../model/team/team';
import { DiscordWebhookService } from '../../../core/discord/discord-webhook.service';
import { LodestoneService } from '../../../core/api/lodestone.service';

@Component({
  selector: 'app-team-invite',
  templateUrl: './team-invite.component.html',
  styleUrls: ['./team-invite.component.less']
})
export class TeamInviteComponent implements OnInit {

  loading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

  error$: ReplaySubject<string> = new ReplaySubject<string>();

  constructor(private route: ActivatedRoute, private router: Router,
              private teamsFacade: TeamsFacade, private teamInviteService: TeamInviteService,
              private authFacade: AuthFacade, private discordWebhook: DiscordWebhookService,
              private characterService: LodestoneService) {
  }

  ngOnInit() {
    this.teamsFacade.loadMyTeams();
    this.route.paramMap.pipe(
      map(params => params.get('inviteId')),
      switchMap(inviteId => this.teamInviteService.get(inviteId)),
      catchError(() => {
        this.error$.next('TEAMS.Invite_error');
        this.loading$.next(false);
        return EMPTY;
      }),
      filter(invite => {
        const expired = new Date(invite.expires).getTime() <= new Date().getTime();
        if (expired) {
          this.error$.next('TEAMS.Invite_error');
          this.loading$.next(false);
          this.teamsFacade.removeTeamInvite(invite.$key);
        }
        return !expired;
      }),
      tap(invite => {
        this.teamsFacade.loadTeam(invite.teamId);
      }),
      switchMap(invite => {
        return this.teamsFacade.allTeams$.pipe(
          map(teams => teams.find(team => team.$key === invite.teamId)),
          filter(team => {
            if (team === undefined) {
              this.error$.next('TEAMS.Invite_error');
              this.loading$.next(false);
            }
            return team !== undefined;
          })
        );
      }),
      switchMap(team => this.authFacade.loggedIn$.pipe(map(loggedIn => ([team, loggedIn])))),
      filter(([team, loggedIn]: [Team, boolean]) => {
        if (!loggedIn) {
          this.error$.next('TEAMS.No_anonymous_join');
          this.loading$.next(false);
        }
        return loggedIn;
      }),
      map(([team]) => team),
      withLatestFrom(this.authFacade.userId$),
      filter(([team, userId]) => {
        const alreadyInteam = team.members.indexOf(userId) > -1;
        if (alreadyInteam) {
          this.error$.next('TEAMS.Already_in_team');
          this.loading$.next(false);
        }
        return !alreadyInteam;
      }),
      map(([team, userId]) => {
        team.members.push(userId);
        return [team, userId];
      }),
      tap(([team]) => this.teamsFacade.updateTeam(team)),
      first()
    ).subscribe(([team, userId]: [Team, string]) => {
      if (team.webhook !== undefined) {
        this.discordWebhook.notifyMemberJoined(team, userId);
      }
      this.router.navigateByUrl('/teams');
    });
  }

}
