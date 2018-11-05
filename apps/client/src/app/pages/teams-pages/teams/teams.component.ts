import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TeamsFacade } from '../../../modules/teams/+state/teams.facade';
import { Observable } from 'rxjs';
import { Team } from '../../../model/team/team';
import { NzMessageService, NzModalService } from 'ng-zorro-antd';
import { TranslateService } from '@ngx-translate/core';
import { NameQuestionPopupComponent } from '../../../modules/name-question-popup/name-question-popup/name-question-popup.component';
import { filter, map } from 'rxjs/operators';
import { AuthFacade } from '../../../+state/auth.facade';
import { TeamInvite } from '../../../model/team/team-invite';
import { DiscordWebhookService } from '../../../core/discord-webhook.service';

@Component({
  selector: 'app-teams',
  templateUrl: './teams.component.html',
  styleUrls: ['./teams.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TeamsComponent {

  myTeams$: Observable<Team[]> = this.teamsFacade.myTeams$;

  loading$: Observable<boolean> = this.teamsFacade.loading$;

  userId$: Observable<string> = this.authFacade.userId$;

  private teamInvitesCache: { [indexx: string]: Observable<TeamInvite[]> } = {};

  constructor(private teamsFacade: TeamsFacade, private dialog: NzModalService, private translate: TranslateService,
              private authFacade: AuthFacade, private discordWebhook: DiscordWebhookService, private message: NzMessageService) {
    this.teamsFacade.loadMyTeams();
  }

  createTeam(): void {
    this.dialog.create({
      nzContent: NameQuestionPopupComponent,
      nzFooter: null,
      nzTitle: this.translate.instant('TEAMS.Create_team')
    }).afterClose.pipe(
      filter(name => name !== undefined),
      map(name => {
        const team = new Team();
        team.name = name;
        this.teamsFacade.createTeam(team);
      })
    ).subscribe();
  }

  getInvites(team: Team): Observable<TeamInvite[]> {
    if (this.teamInvitesCache[team.$key] === undefined) {
      this.teamInvitesCache[team.$key] = this.teamsFacade.getTeamInvites(team);
    }
    return this.teamInvitesCache[team.$key];
  }

  deleteInvite(invite: TeamInvite): void {
    this.teamsFacade.removeTeamInvite(invite.$key);
  }

  createInvite(team: Team, infinite: boolean): void {
    return this.teamsFacade.createTeamInvite(team, infinite);
  }

  testHook(team: Team): void {
    if (team.webhook !== undefined) {
      this.discordWebhook.sendMessage(team.webhook, 'TEAMS.Webhook_setup_complete', { teamName: team.name }, team.language);
    }
  }

  renameTeam(team: Team): void {
    this.dialog.create({
      nzContent: NameQuestionPopupComponent,
      nzFooter: null,
      nzComponentParams: { baseName: team.name },
      nzTitle: this.translate.instant('TEAMS.Create_team')
    }).afterClose.pipe(
      filter(name => name !== undefined),
      map(name => {
        if (team.webhook !== undefined) {
          this.discordWebhook.sendMessage(team.webhook, 'TEAMS.Name_changed', { oldName: team.name, newName: name }, team.language);
        }
        team.name = name;
        this.teamsFacade.updateTeam(team);
      })
    ).subscribe();
  }

  removeMember(team: Team, memberId: string, memberName: string): void {
    team.members = team.members.filter(member => member !== memberId);
    if (team.webhook !== undefined) {
      this.discordWebhook.sendMessage(team.webhook, 'TEAMS.Member_removed', { memberName: memberName, teamName: team.name }, team.language);
    }
    this.updateTeam(team);
  }

  updateTeam(team: Team): void {
    this.teamsFacade.updateTeam(team);
  }

  deleteTeam(team: Team): void {
    this.teamsFacade.deleteTeam(team.$key);
  }

  success(message: string): void {
    this.message.success(this.translate.instant(message));
  }

  trackByTeam(index: number, team: Team): string {
    return team.$key;
  }
}
