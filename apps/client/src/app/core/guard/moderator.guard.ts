import { Injectable } from '@angular/core';
import { CanLoad } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthFacade } from '../../+state/auth.facade';

@Injectable()
export class ModeratorGuard implements CanLoad {

  constructor(private authFacade: AuthFacade) {
  }

  canLoad(): Observable<boolean> {
    return this.authFacade.user$.pipe(map(user => user.admin || user.moderator));
  }
}
