import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot} from '@angular/router';
import {Observable, of} from 'rxjs';
import {UserService} from '../database/user.service';

@Injectable()
export class PatreonGuard implements CanActivate {

    constructor(private userService: UserService) {
    }

    canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
        // Block the route if it's patron-locked
        // return this.userService.getUserData().pipe(map(user => user.patron || user.admin));
        return of(false);
    }
}
