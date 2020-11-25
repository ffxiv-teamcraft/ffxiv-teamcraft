import { Injectable } from '@angular/core';
import { CanActivate, CanLoad } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthFacade } from '../../+state/auth.facade';

@Injectable()
export class LoggedInGuard implements CanActivate, CanLoad {

  constructor(private authFacade: AuthFacade) {
  }

  canActivate(): Observable<boolean> {
    return this.authFacade.loggedIn$;
  }

  canLoad(): Observable<boolean> {
    return this.authFacade.loggedIn$;
  }
}
