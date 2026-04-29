import { Injectable, inject } from '@angular/core';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthFacade } from '../../+state/auth.facade';

@Injectable()
export class AdminGuard  {
  private authFacade = inject(AuthFacade);


  // Block the route if it's admin-locked
  isAdmin$ = this.authFacade.user$.pipe(map(user => user.admin));

  canActivate(): Observable<boolean> {
    return this.isAdmin$;
  }

  canLoad(): Observable<boolean> {
    return this.isAdmin$;
  }
}
