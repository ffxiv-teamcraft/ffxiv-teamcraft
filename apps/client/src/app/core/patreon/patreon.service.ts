import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthFacade } from '../../+state/auth.facade';
import { TeamcraftUser } from '../../model/user/teamcraft-user';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable()
export class PatreonService {

  constructor(private http: HttpClient, private authFacade: AuthFacade) {
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
}
