import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { TeamsFacade } from '../../../modules/teams/+state/teams.facade';
import { BehaviorSubject, Observable } from 'rxjs';
import { Team } from '../../../model/team/team';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { NameQuestionPopupComponent } from '../../../modules/name-question-popup/name-question-popup/name-question-popup.component';
import { filter, first, map, switchMap } from 'rxjs/operators';
import { AuthFacade } from '../../../+state/auth.facade';
import { TeamInvite } from '../../../model/team/team-invite';
import { DiscordWebhookService } from '../../../core/discord/discord-webhook.service';
import { PlatformService } from '../../../core/tools/platform.service';
import { IpcService } from '../../../core/electron/ipc.service';
import { WebhookSetting } from '../../../model/team/webhook-setting';
import { OauthService } from '../../../core/auth/oauth.service';
import { SettingsService } from '../../../modules/settings/settings.service';
import { TeamcraftLinkPipe } from '../../../pipes/pipes/teamcraft-link.pipe';
import { CharacterNamePipe } from '../../../pipes/pipes/character-name.pipe';
import { FullpageMessageComponent } from '../../../modules/fullpage-message/fullpage-message/fullpage-message.component';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { UserAvatarComponent } from '../../../modules/user-avatar/user-avatar/user-avatar.component';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { ClipboardDirective } from '../../../core/clipboard.directive';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { FormsModule } from '@angular/forms';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzWaveModule } from 'ng-zorro-antd/core/wave';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { FlexModule } from '@angular/flex-layout/flex';
import { PageLoaderComponent } from '../../../modules/page-loader/page-loader/page-loader.component';
import { NgIf, NgFor, AsyncPipe, DatePipe } from '@angular/common';

@Component({
    selector: 'app-teams',
    templateUrl: './teams.component.html',
    styleUrls: ['./teams.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NgIf, PageLoaderComponent, FlexModule, NzButtonModule, NzWaveModule, NzToolTipModule, NzIconModule, NgFor, NzCollapseModule, NzPopconfirmModule, NzSelectModule, FormsModule, NzGridModule, NzCheckboxModule, NzAlertModule, NzListModule, ClipboardDirective, NzTagModule, UserAvatarComponent, NzDividerModule, FullpageMessageComponent, AsyncPipe, DatePipe, TranslateModule, CharacterNamePipe, TeamcraftLinkPipe]
})
export class TeamsComponent implements OnInit {

  myTeams$: Observable<Team[]> = this.teamsFacade.myTeams$;

  loading$: Observable<boolean> = this.teamsFacade.loading$;

  userId$: Observable<string> = this.authFacade.userId$;

  errorCode$: BehaviorSubject<string> = new BehaviorSubject(undefined);

  public params: any;

  private teamInvitesCache: { [indexx: string]: Observable<TeamInvite[]> } = {};

  private redirectUri: string;

  constructor(private teamsFacade: TeamsFacade, private dialog: NzModalService, private translate: TranslateService,
              private authFacade: AuthFacade, private discordWebhook: DiscordWebhookService,
              private message: NzMessageService, private route: ActivatedRoute, private router: Router,
              private http: HttpClient, private platform: PlatformService,
              private ipc: IpcService, private oauth: OauthService,
              public settings: SettingsService) {
    this.teamsFacade.loadMyTeams();
  }

  ngOnInit(): void {
    this.params = this.route.snapshot.queryParams;
    this.redirectUri = window.location.href.replace(/\?.*/, '');

    if (this.params.code && this.params.state) {
      this.http.get(`https://us-central1-ffxivteamcraft.cloudfunctions.net/create-webhook?code=${this.params.code}&redirect_uri=${this.redirectUri}`)
        .pipe(
          switchMap((response: any) => {
            return this.setWebhook(this.params.state, response.webhook.url);
          })
        ).subscribe({
        error: error => this.errorCode$.next(error.error)
      });
    }
  }

  public addOfficer(team: Team, member: string): void {
    team.officers.push(member);
    this.updateTeam(team);
  }

  public removeOfficer(team: Team, member: string): void {
    team.officers = team.officers.filter(m => m !== member);
    this.updateTeam(team);
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
      this.discordWebhook.sendMessage(team, 'TEAMS.NOTIFICATIONS.Webhook_setup_complete', { teamName: team.name });
    }
  }

  clearHook(team: Team): void {
    delete team.webhook;
    this.updateTeam(team);
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
          this.discordWebhook.sendMessage(team, 'TEAMS.NOTIFICATIONS.Name_changed', {
            oldName: team.name,
            newName: name
          });
        }
        team.name = name;
        this.teamsFacade.updateTeam(team);
      })
    ).subscribe();
  }

  removeMember(team: Team, memberId: string): void {
    team.members = team.members.filter(member => member !== memberId);
    if (team.webhook !== undefined) {
      this.discordWebhook.notifyMemberKicked(team, memberId);
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

  trackByPermission(index: number, permission: WebhookSetting): string {
    return permission.name;
  }

  discordOauth(team: Team): void {
    if (this.platform.isDesktop()) {
      this.oauth.desktopOauth({
        authorize_url: 'https://discordapp.com/api/oauth2/authorize',
        client_id: '514350168678727681',
        scope: 'webhook.incoming',
        gcf: 'https://us-central1-ffxivteamcraft.cloudfunctions.net/create-webhook',
        response_type: 'code'
      }).pipe(
        switchMap((response: any) => {
          return this.setWebhook(team.$key, response.webhook.url);
        })
      ).subscribe({
        error: error => this.errorCode$.next(error.error)
      });
    } else {
      window.open(this.discordWebhook.oauthUrl(team.$key, this.redirectUri));
    }
  }

  private setWebhook(key: string, hook: string): Observable<any> {
    return this.myTeams$.pipe(
      map(teams => teams.find(team => team.$key === key)),
      first(team => team !== undefined),
      map((team: Team) => {
        team.webhook = hook;
        this.updateTeam(team);
        this.testHook(team);
        this.router.navigate([]);
      })
    );
  }
}
