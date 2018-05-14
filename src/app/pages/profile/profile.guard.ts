import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot} from '@angular/router';
import {Observable} from 'rxjs';
import {UserService} from '../../core/database/user.service';
import {map} from 'rxjs/operators';

@Injectable()
export class ProfileGuard implements CanActivate {

    constructor(private userService: UserService) {
    }

    canActivate(next: ActivatedRouteSnapshot,
                state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
        return this.userService.getUserData().pipe(
            map(user => {
                return !user.anonymous && user.lodestoneId !== undefined;
            })
        );
    }
}
