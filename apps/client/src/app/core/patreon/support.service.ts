import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthFacade } from '../../+state/auth.facade';
import { TeamcraftUser } from '../../model/user/teamcraft-user';
import { catchError, first, map, switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { NzModalService } from 'ng-zorro-antd/modal';
import { TranslateService } from '@ngx-translate/core';
import { SupportUsPopupComponent } from './support-us-popup/support-us-popup.component';
import { NzMessageService } from 'ng-zorro-antd/message';
import { PlatformService } from '../tools/platform.service';
import { IpcService } from '../electron/ipc.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class SupportService {

  constructor(private http: HttpClient, private authFacade: AuthFacade,
              private dialog: NzModalService, private translate: TranslateService,
              private platform: PlatformService, private ipc: IpcService,
              private message: NzMessageService, private router: Router) {
  }

  public patreonOauth(): void {
    if (this.platform.isDesktop()) {
      this.ipc.once('oauth-reply', (event, code) => {
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

  public refreshToken(user: TeamcraftUser): void {
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

  public showSupportUsPopup(): void {
    this.dialog.create({
      nzTitle: this.translate.instant('Like_the_tool'),
      nzContent: SupportUsPopupComponent,
      nzFooter: null
    });
  }
}
