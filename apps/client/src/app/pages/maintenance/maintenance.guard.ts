import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AngularFireDatabase } from '@angular/fire/database';
import { map } from 'rxjs/operators';

@Injectable()
export class MaintenanceGuard implements CanActivate {

  constructor(private firebase: AngularFireDatabase) {
  }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    // We want to block the route if the maintenance mode is on, meaning that we want to allow it if it's not.
    return this.firebase.object('maintenance')
      .valueChanges()
      .pipe(
        map(maintenance => !maintenance || !environment.production)
      );
  }
}
