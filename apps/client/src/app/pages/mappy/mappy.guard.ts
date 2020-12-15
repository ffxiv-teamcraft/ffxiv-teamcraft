import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanLoad, Route, RouterStateSnapshot, UrlSegment } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthFacade } from '../../+state/auth.facade';
import { SettingsService } from '../../modules/settings/settings.service';

@Injectable({
  providedIn: 'root'
})
export class MappyGuard implements CanActivate, CanLoad {

  private hasAccess$ = this.authFacade.user$.pipe(
    map(user => {
      return user.sekrit && !!this.settings.xivapiKey;
    })
  );

  constructor(private authFacade: AuthFacade, private settings: SettingsService) {
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> {
    return this.hasAccess$;
  }

  canLoad(
    route: Route,
    segments: UrlSegment[]): Observable<boolean> {
    return this.hasAccess$;
  }
}
