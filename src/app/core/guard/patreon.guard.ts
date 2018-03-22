import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot} from '@angular/router';
import {Observable} from 'rxjs/Observable';
import {UserService} from '../database/user.service';

@Injectable()
export class PatreonGuard implements CanActivate {

    constructor(private userService: UserService) {
    }

    canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
        // Block the route if it's patron-locked
        return this.userService.getUserData().map(user => user.patron || user.admin);
    }
}
