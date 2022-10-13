import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { map } from 'rxjs/operators';
import { isPlatformServer } from '@angular/common';
import * as semver from 'semver';
import { Database, objectVal, ref } from '@angular/fire/database';
import { IS_HEADLESS } from '../../../environments/is-headless';

@Injectable()
export class VersionLockGuard implements CanActivate {

  constructor(private firebase: Database, @Inject(PLATFORM_ID) private platform: any) {
  }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    if (isPlatformServer(this.platform) || IS_HEADLESS) {
      return of(true);
    }
    // We want to block the route if the maintenance mode is on, meaning that we want to allow it if it's not.
    return objectVal<string>(ref(this.firebase, 'version_lock'))
      .pipe(
        map(version => {
          return semver.gte(environment.version, version);
        })
      );
  }
}
