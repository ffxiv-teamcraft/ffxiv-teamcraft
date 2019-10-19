import { Component } from '@angular/core';
import { SettingsService } from '../settings.service';
import { TranslateService } from '@ngx-translate/core';
import { PlatformService } from '../../../core/tools/platform.service';
import { AuthFacade } from '../../../+state/auth.facade';
import { AngularFireAuth } from '@angular/fire/auth';
import { NzMessageService } from 'ng-zorro-antd';
import { first, map, switchMap, tap } from 'rxjs/operators';
import { IpcService } from '../../../core/electron/ipc.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { UserService } from '../../../core/database/user.service';
import { TeamcraftUser } from '../../../model/user/teamcraft-user';
import { CustomLinksFacade } from '../../custom-links/+state/custom-links.facade';
import { CustomLink } from '../../../core/database/custom-links/custom-link';
import { Theme } from '../theme';
import { aetherytes } from '../../../core/data/sources/aetherytes';

@Component({
  selector: 'app-settings-popup',
  templateUrl: './settings-popup.component.html',
  styleUrls: ['./settings-popup.component.less']
})
export class SettingsPopupComponent {

  selectedTab = 0;

  availableLanguages = this.settings.availableLocales;

  loggedIn$ = this.authFacade.loggedIn$;

  user$ = this.authFacade.user$;

  nicknameAvailable: boolean;

  availableThemes = Theme.ALL_THEMES;

  alwaysOnTop = false;

  machinaToggle = false;

  customTheme: Theme;

  startingPlaces = [
    {
      id: 12,
      placenameId: 500
    },
    {
      id: 13,
      placenameId: 504
    },
    {
      id: 2,
      placenameId: 506
    },
    {
      id: 111,
      placenameId: 513
    },
    {
      id: 133,
      placenameId: 516
    },
    {
      id: 134,
      placenameId: 517
    }
  ];

  public allAetherytes = aetherytes.filter(a => a.nameid !== 0);

  public favoriteAetherytes = this.settings.favoriteAetherytes;

  constructor(public settings: SettingsService, public translate: TranslateService,
              public platform: PlatformService, private authFacade: AuthFacade,
              private af: AngularFireAuth, private message: NzMessageService,
              private ipc: IpcService, private router: Router, private http: HttpClient,
              private userService: UserService, private customLinksFacade: CustomLinksFacade) {

    this.ipc.on('always-on-top:value', (event, value) => {
      this.alwaysOnTop = value;
    });
    this.ipc.on('toggle-machina:value', (event, value) => {
      this.machinaToggle = value;
    });
    this.ipc.send('always-on-top:get');
    this.ipc.send('toggle-machina:get');
    this.customTheme = this.settings.customTheme;
  }

  alwaysOnTopChange(value: boolean): void {
    this.ipc.send('always-on-top', value);
  }

  machinaToggleChange(value: boolean): void {
    if (value) {
      this.settings.enableUniversalisSourcing = true;
    }
    this.ipc.send('toggle-machina', value);
  }

  openDesktopConsole(): void {
    this.ipc.send('show-devtools');
  }

  clearCache(): void {
    this.ipc.send('clear-cache');
  }

  clearSearchHistory(): void {
    localStorage.removeItem('search:history');
  }

  patreonOauth(): void {
    if (this.platform.isDesktop()) {
      this.ipc.on('oauth-reply', (event, code) => {
        this.http.get(`https://us-central1-ffxivteamcraft.cloudfunctions.net/patreon-oauth?code=${code}&redirect_uri=http://localhost`)
          .pipe(
            switchMap((response: any) => {
              return this.authFacade.user$.pipe(
                first(),
                map(user => {
                  user.patreonToken = response.access_token;
                  user.patreonRefreshToken = response.refresh_token;
                  user.lastPatreonRefresh = Date.now();
                  return user;
                }),
                tap(updatedUser => {
                  this.authFacade.updateUser(updatedUser);
                  this.message.success(this.translate.instant('Patreon_login_success'));
                  this.router.navigate(['/']);
                })
              );
            })
          ).subscribe();
      });
      this.ipc.send('oauth', 'patreon.com');
    } else {
      window.open(`https://www.patreon.com/oauth2/authorize?response_type=code&client_id=MMmud8pCDGgQkhd8H2g_SpRWgzvCYwyawjSqmvjl_pjOA7Yco6Cp-Ljv8InmGMUE&redirect_uri=${
        window.location.protocol}//${window.location.host}/patreon-redirect&scope=identity`);
    }
  }

  resetPassword(): void {
    this.af.auth.sendPasswordResetEmail(this.af.auth.currentUser.email).then(() => {
      this.message.success(this.translate.instant('SETTINGS.Password_reset_mail_sent'));
    });
  }

  checkNicknameAvailability(nickname: string): void {
    this.userService.checkNicknameAvailability(nickname).pipe(first()).subscribe(res => this.nicknameAvailable = res);
  }

  setNickname(user: TeamcraftUser, nickname: string): void {
    this.customLinksFacade.myCustomLinks$.pipe(
      first(),
      map((links: CustomLink[]) => links.map(link => {
        link.authorNickname = nickname;
        return link;
      }))
    ).subscribe(links => {
      links.forEach(link => this.customLinksFacade.updateCustomLink(link));
      user.nickname = nickname;
      this.authFacade.updateUser(user);
    });
  }

  setLanguage(lang: string): void {
    localStorage.setItem('locale', lang);
    this.translate.use(lang);
    this.ipc.send('language', lang);
  }

  saveCustomTheme(): void {
    this.settings.customTheme = this.customTheme;
  }

  setTheme(themeName: string): void {
    this.settings.theme = Theme.byName(themeName) || this.settings.customTheme;
    if (themeName === 'CUSTOM') {
      this.saveCustomTheme();
    }
  }

}
