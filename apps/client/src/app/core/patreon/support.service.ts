import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { AuthFacade } from '../../+state/auth.facade';
import { TeamcraftUser } from '../../model/user/teamcraft-user';
import { catchError, first, map, switchMap } from 'rxjs/operators';
import { from, Observable, of } from 'rxjs';
import { NzModalService } from 'ng-zorro-antd/modal';
import { TranslateService } from '@ngx-translate/core';
import { SupportUsPopupComponent } from './support-us-popup/support-us-popup.component';
import { NzMessageService } from 'ng-zorro-antd/message';
import { PlatformService } from '../tools/platform.service';
import { Router } from '@angular/router';
import { OauthService } from '../auth/oauth.service';
import { createOauthState } from '../auth/oauth-state';

@Injectable({
  providedIn: 'root'
})
export class SupportService {

  constructor(private http: HttpClient, private authFacade: AuthFacade,
              private dialog: NzModalService, private translate: TranslateService,
              private platform: PlatformService, private message: NzMessageService,
              private router: Router, private oauth: OauthService) {
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
        window.location.protocol}//${window.location.host}/patreon-redirect&scope=identity&state=${createOauthState('patreon')}`);
    }
  }

  public refreshPatreonToken(user: TeamcraftUser): Observable<TeamcraftUser> {
    return this.refreshToken('patreon-oauth-refresh')
      .pipe(
        map((response: any) => {
          if (response === undefined) {
            return user;
          }
          if (response === null) {
            delete user.patreonToken;
            delete user.patreonRefreshToken;
            delete user.lastPatreonRefresh;
          } else {
            user.patreonToken = response.access_token;
            user.patreonRefreshToken = response.refresh_token;
            user.lastPatreonRefresh = Date.now();
          }
          return user;
        })
      );
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
        window.location.protocol}//${window.location.host}/tipeee-redirect&scope=PARTNER&state=${createOauthState('tipeee')}`);
    }
  }

  public refreshTipeeeToken(user: TeamcraftUser): Observable<TeamcraftUser> {
    return this.refreshToken('tipeee-oauth-refresh')
      .pipe(
        map((response: any) => {
          if (response === undefined) {
            return user;
          }
          if (response === null) {
            delete user.tipeeeToken;
            delete user.tipeeeRefreshToken;
            delete user.lastTipeeeRefresh;
          } else {
            user.tipeeeToken = response.access_token;
            user.tipeeeRefreshToken = response.refresh_token;
            user.lastTipeeeRefresh = Date.now();
          }
          return user;
        })
      );
  }

  public showSupportUsPopup(): void {
    this.translate.get('Like_the_tool').pipe(
      first()
    ).subscribe(title => {
      this.dialog.create({
        nzTitle: title,
        nzContent: SupportUsPopupComponent,
        nzFooter: null
      });
    });
  }

  /**
   * Calls a token refresh function as the signed-in user; the function reads the refresh token from the user's data.
   * Emits the provider response, null if the provider rejected the refresh token (the account should be unlinked),
   * or undefined if the refresh couldn't be attempted (network, authentication), in which case nothing changes.
   */
  private refreshToken(functionName: string): Observable<any> {
    return from(this.authFacade.getIdTokenResult()).pipe(
      switchMap(({ token }) => {
        return this.http.get(`https://us-central1-ffxivteamcraft.cloudfunctions.net/${functionName}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }),
      catchError((error: HttpErrorResponse) => of(error?.status === 400 ? null : undefined))
    );
  }
}
