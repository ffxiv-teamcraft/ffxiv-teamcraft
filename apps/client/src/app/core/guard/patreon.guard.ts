import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthFacade } from '../../+state/auth.facade';

@Injectable()
export class PatreonGuard implements CanActivate {

  constructor(private authFacade: AuthFacade) {
  }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.authFacade.user$.pipe(map(user => user.patron || user.admin));
  }
}
