import { ApolloLink, InMemoryCache } from '@apollo/client/core';
import { HttpLink } from 'apollo-angular/http';
import { AuthFacade } from './+state/auth.facade';
import { setContext } from '@apollo/client/link/context';
import { filter, firstValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';

export function apolloClientFactory(httpLink: HttpLink, authFacade: AuthFacade) {
  const httpL = httpLink.create({ uri: 'https://api.ffxivteamcraft.com/gubal' });

  const httpAuth = setContext((operation, context) => {
    return firstValueFrom(authFacade.idToken$.pipe(
      filter((token: any) => token.claims['https://hasura.io/jwt/claims'] !== undefined),
      map(idToken => {
        return {
          headers: {
            Authorization: `Bearer ${idToken.token}`
          }
        };
      })
    ));
  });

  const link = ApolloLink.from([httpAuth, httpL]);
  return {
    link,
    cache: new InMemoryCache({
      addTypename: false
    })
  };
}
