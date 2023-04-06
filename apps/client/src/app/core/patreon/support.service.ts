import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthFacade } from '../../+state/auth.facade';
import { TeamcraftUser } from '../../model/user/teamcraft-user';
import { catchError, first, map, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { NzModalService } from 'ng-zorro-antd/modal';
import { TranslateService } from '@ngx-translate/core';
import { SupportUsPopupComponent } from './support-us-popup/support-us-popup.component';
import { NzMessageService } from 'ng-zorro-antd/message';
import { PlatformService } from '../tools/platform.service';
import { IpcService } from '../electron/ipc.service';
import { Router } from '@angular/router';
import { OauthService } from '../auth/oauth.service';

@Injectable({
  providedIn: 'root'
})
export class SupportService {

  constructor(private http: HttpClient, private authFacade: AuthFacade,
              private dialog: NzModalService, private translate: TranslateService,
              private platform: PlatformService, private ipc: IpcService,
              private message: NzMessageService, private router: Router,
              private oauth: OauthService) {
  }

  public patreonOauth(): void {
    if (this.platform.isDesktop()) {
      this.oauth.desktopOauth({
        authorize_url: 'https://www.patreon.com/oauth2/authorize',
        client_id: 'MMmud8pCDGgQkhd8H2g_SpRWgzvCYwyawjSqmvjl_pjOA7Yco6Cp-Ljv8InmGMUE',
        gcf: 'https://us-central1-ffxivteamcraft.cloudfunctions.net/patreon-oauth',
        scope: 'identity',
        response_type: 'code'
      }).pipe(
        switchMap((response: any) => {
          return this.authFacade.user$.pipe(
            first(),
            map(user => {
              user.patreonToken = response.access_token;
              user.patreonRefreshToken = response.refresh_token;
              user.lastPatreonRefresh = Date.now();
              return user;
            })
          );
        })
      ).subscribe(updatedUser => {
        this.authFacade.updateUser(updatedUser);
        this.message.success(this.translate.instant('Patreon_login_success'));
        this.router.navigate(['/']);
      });
    } else {
      window.open(`https://www.patreon.com/oauth2/authorize?response_type=code&client_id=MMmud8pCDGgQkhd8H2g_SpRWgzvCYwyawjSqmvjl_pjOA7Yco6Cp-Ljv8InmGMUE&redirect_uri=${
        window.location.protocol}//${window.location.host}/patreon-redirect&scope=identity`);
    }
  }

  public refreshPatreonToken(user: TeamcraftUser): void {
    this.http.get(`https://us-central1-ffxivteamcraft.cloudfunctions.net/patreon-oauth-refresh?refresh_token=${user.patreonRefreshToken}`)
      .pipe(catchError(() => {
        return of(null);
      }))
      .subscribe((response: any) => {
        if (response === null) {
          delete user.patreonToken;
          delete user.patreonRefreshToken;
          delete user.lastPatreonRefresh;
        } else {
          user.patreonToken = response.access_token;
          user.patreonRefreshToken = response.refresh_token;
          user.lastPatreonRefresh = Date.now();
        }
        this.authFacade.updateUser(user);
      });
  }

  public tipeeeOauth(): void {
    if (this.platform.isDesktop()) {
      this.oauth.desktopOauth({
        authorize_url: 'https://tipeee.com/oauth/v2/auth',
        client_id: '4_M3H9Otm5Td79MwS2IXQPJ9LCyYmGtOrMFgA3fLA0aM3rzDCAJ7',
        gcf: 'https://us-central1-ffxivteamcraft.cloudfunctions.net/tipeee-oauth',
        scope: 'PARTNER',
        response_type: 'code'
      }).pipe(
        switchMap((response: any) => {
          return this.authFacade.user$.pipe(
            first(),
            map(user => {
              user.tipeeeToken = response.access_token;
              user.tipeeeRefreshToken = response.refresh_token;
              user.lastTipeeeRefresh = Date.now();
              return user;
            })
          );
        })
      ).subscribe(updatedUser => {
        this.authFacade.updateUser(updatedUser);
        this.message.success(this.translate.instant('Tipeee_login_success'));
        this.router.navigate(['/']);
      });
    } else {
      window.open(`https://tipeee.com/oauth/v2/auth?response_type=code&client_id=4_M3H9Otm5Td79MwS2IXQPJ9LCyYmGtOrMFgA3fLA0aM3rzDCAJ7&redirect_uri=${
        window.location.protocol}//${window.location.host}/tipeee-redirect&scope=PARTNER`);
    }
  }

  public refreshTipeeeToken(user: TeamcraftUser): void {
    this.http.get(`https://us-central1-ffxivteamcraft.cloudfunctions.net/tipeee-oauth-refresh?refresh_token=${user.tipeeeRefreshToken}`)
      .pipe(catchError(() => {
        return of(null);
      }))
      .subscribe((response: any) => {
        if (response === null) {
          delete user.tipeeeToken;
          delete user.tipeeeRefreshToken;
          delete user.lastTipeeeRefresh;
        } else {
          user.tipeeeToken = response.access_token;
          user.tipeeeRefreshToken = response.refresh_token;
          user.lastTipeeeRefresh = Date.now();
        }
        this.authFacade.updateUser(user);
      });
  }

  public showSupportUsPopup(): void {
    this.dialog.create({
      nzTitle: this.translate.instant('Like_the_tool'),
      nzContent: SupportUsPopupComponent,
      nzFooter: null
    });
  }
}
