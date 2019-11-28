import { Injectable } from '@angular/core';
import { HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { AuthFacade } from './+state/auth.facade';
import { filter, switchMap } from 'rxjs/operators';

@Injectable()
export class ApolloInterceptor implements HttpInterceptor {

  constructor(private authFacade: AuthFacade) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    if (req.url.indexOf('/graphql') > -1) {
      return this.authFacade.idToken$
        .pipe(
          filter(token => token.claims['https://hasura.io/jwt/claims'] !== undefined),
          switchMap(idToken => {
            const clone = req.clone({
              setHeaders: {
                Authorization: `Bearer ${idToken.token}`
              }
            });
            return next.handle(clone);
          })
        );
    }
    return next.handle(req);
  }
}

