import { Injectable } from '@angular/core';
import { Route, UrlSegment } from '@angular/router';
import { Observable } from 'rxjs';
import { first, map } from 'rxjs/operators';
import { AuthFacade } from '../../+state/auth.facade';

@Injectable()
export class ModeratorGuard  {

  constructor(private authFacade: AuthFacade) {
  }

  canLoad(route: Route, segments: UrlSegment[]): Observable<boolean> {
    return this.authFacade.user$.pipe(
      map(user => user.admin || user.moderator),
      first()
    );
  }
}
