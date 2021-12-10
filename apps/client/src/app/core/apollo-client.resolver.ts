import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { Apollo } from 'apollo-angular';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ApolloClientResolver implements Resolve<unknown> {
  constructor(private apollo: Apollo) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<unknown> {
    // Ugly hack to check for apollo client before loading a page, ugly due to apollo-angular being shit.
    const watcher$ = new Subject();
    const interval = setInterval(() => {
      if (this.apollo.getClient() !== undefined) {
        watcher$.next();
        watcher$.complete();
        clearInterval(interval);
      }
    }, 100);
    return watcher$.asObservable();
  }

}
