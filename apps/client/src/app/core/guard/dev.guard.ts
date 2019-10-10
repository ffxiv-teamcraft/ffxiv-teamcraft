import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanLoad, Route, RouterStateSnapshot, UrlSegment } from '@angular/router';
import { environment } from '../../../environments/environment';

@Injectable()
export class DevGuard implements CanActivate, CanLoad {

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    return !environment.production;
  }

  canLoad(route: Route, segments: UrlSegment[]): boolean {
    return !environment.production;
  }
}
