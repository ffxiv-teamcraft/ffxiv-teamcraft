import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Route, RouterStateSnapshot, UrlSegment } from '@angular/router';
import { environment } from '../../../environments/environment';

@Injectable()
export class DevGuard  {

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    return !environment.production;
  }

  canLoad(route: Route, segments: UrlSegment[]): boolean {
    return !environment.production;
  }
}
