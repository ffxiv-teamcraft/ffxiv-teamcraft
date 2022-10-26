import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { first, map, switchMap, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { AuthFacade } from '../../../+state/auth.facade';
import { NzMessageService } from 'ng-zorro-antd/message';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-patreon-redirect',
  templateUrl: './patreon-redirect.component.html',
  styleUrls: ['./patreon-redirect.component.less']
})
export class PatreonRedirectComponent {

  public errorCode: string;

  constructor(private route: ActivatedRoute, private http: HttpClient, private authFacade: AuthFacade,
              private router: Router, private message: NzMessageService, private translate: TranslateService) {
    this.route.queryParams.pipe(
      first()
    ).subscribe(params => {
      if (params.code) {
        this.http.get(`https://us-central1-ffxivteamcraft.cloudfunctions.net/patreon-oauth?code=${params.code}&redirect_uri=${
          window.location.protocol}//${window.location.host}/patreon-redirect`)
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
          ).subscribe({
          error: error => this.errorCode = error.error
        });
      }
    });
  }

}
