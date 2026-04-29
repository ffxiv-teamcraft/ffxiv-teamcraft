import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, Route, RouterStateSnapshot, UrlSegment } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthFacade } from '../../+state/auth.facade';
import { SettingsService } from '../../modules/settings/settings.service';

@Injectable({
  providedIn: 'root'
})
export class MappyGuard  {
  private authFacade = inject(AuthFacade);
  private settings = inject(SettingsService);


  private hasAccess$ = this.authFacade.user$.pipe(
    map(user => {
      return user.sekrit && !!this.settings.xivapiKey;
    })
  );

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
