import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { UserService } from '../database/user.service';
import { map } from 'rxjs/operators';
import { AuthFacade } from '../../+state/auth.facade';

@Injectable()
export class AdminGuard implements CanActivate {

  constructor(private authFacade: AuthFacade) {
  }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    // Block the route if it's admin-locked
    return this.authFacade.user$.pipe(map(user => user.admin));
  }
}
