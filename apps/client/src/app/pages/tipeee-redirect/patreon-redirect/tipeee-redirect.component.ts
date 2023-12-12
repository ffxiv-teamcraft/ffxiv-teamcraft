import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { first, map, switchMap, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { AuthFacade } from '../../../+state/auth.facade';
import { NzMessageService } from 'ng-zorro-antd/message';
import { TranslateService } from '@ngx-translate/core';
import { UserService } from '../../../core/database/user.service';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NgIf } from '@angular/common';

@Component({
    selector: 'app-tipeee-redirect',
    templateUrl: './tipeee-redirect.component.html',
    styleUrls: ['./tipeee-redirect.component.less'],
    standalone: true,
    imports: [NgIf, NzAlertModule]
})
export class TipeeeRedirectComponent {

  public errorCode: string;

  constructor(private route: ActivatedRoute, private http: HttpClient, private authFacade: AuthFacade,
              private router: Router, private message: NzMessageService, private translate: TranslateService,
              private userService: UserService) {
    this.route.queryParams.pipe(
      first()
    ).subscribe(params => {
      if (params.code) {
        this.http.get(`https://us-central1-ffxivteamcraft.cloudfunctions.net/tipeee-oauth?code=${params.code}&redirect_uri=${
          window.location.protocol}//${window.location.host}/tipeee-redirect`)
          .pipe(
            switchMap((response: any) => {
              return this.authFacade.user$.pipe(
                first(),
                map(user => {
                  user.tipeeeToken = response.access_token;
                  user.tipeeeRefreshToken = response.refresh_token;
                  user.lastTipeeeRefresh = Date.now();
                  return user;
                }),
                tap(updatedUser => {
                  this.authFacade.updateUser(updatedUser);
                  this.message.success(this.translate.instant('Tipeee_login_success'));
                  this.userService.reloader$.next();
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
