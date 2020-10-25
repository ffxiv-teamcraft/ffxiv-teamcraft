import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthFacade } from '../../+state/auth.facade';
import { TeamcraftUser } from '../../model/user/teamcraft-user';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { NzModalService } from 'ng-zorro-antd/modal';
import { TranslateService } from '@ngx-translate/core';
import { SupportUsPopupComponent } from './support-us-popup/support-us-popup.component';

@Injectable()
export class PatreonService {

  constructor(private http: HttpClient, private authFacade: AuthFacade,
              private dialog: NzModalService, private translate: TranslateService) {
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
