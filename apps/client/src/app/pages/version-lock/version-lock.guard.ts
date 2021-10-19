import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { map } from 'rxjs/operators';
import { isPlatformServer } from '@angular/common';
import * as semver from 'semver';

@Injectable()
export class VersionLockGuard implements CanActivate {

  constructor(private firebase: AngularFireDatabase, @Inject(PLATFORM_ID) private platform: Object) {
  }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    if (isPlatformServer(this.platform)) {
      return of(true);
    }
    // We want to block the route if the maintenance mode is on, meaning that we want to allow it if it's not.
    return this.firebase.object<string>('version_lock')
      .valueChanges()
      .pipe(
        map(version => {
          return semver.gte(environment.version, version);
        })
      );
  }
}
