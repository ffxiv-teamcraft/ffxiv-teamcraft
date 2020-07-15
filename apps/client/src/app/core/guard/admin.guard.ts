import { Injectable } from '@angular/core';
import { CanActivate, CanLoad } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthFacade } from '../../+state/auth.facade';

@Injectable()
export class AdminGuard implements CanActivate, CanLoad {

  // Block the route if it's admin-locked
  isAdmin$ = this.authFacade.user$.pipe(map(user => user.admin));

  constructor(private authFacade: AuthFacade) {
  }

  canActivate(): Observable<boolean> {
    return this.isAdmin$;
  }

  canLoad(): Observable<boolean> {
    return this.isAdmin$;
  }
}
