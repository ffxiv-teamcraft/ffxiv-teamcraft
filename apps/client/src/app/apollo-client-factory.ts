import { ApolloLink, InMemoryCache, split } from '@apollo/client/core';
import { WebSocketLink } from '@apollo/client/link/ws';
import { getMainDefinition } from '@apollo/client/utilities';
import { HttpLink } from 'apollo-angular/http';
import { AuthFacade } from './+state/auth.facade';
import { setContext } from '@apollo/client/link/context';
import { filter, firstValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';

export function apolloClientFactory(httpLink: HttpLink, authFacade: AuthFacade) {
  const ws = new WebSocketLink({
    uri: `wss://gubal.hasura.app/v1/graphql`,
    options: {
      reconnect: true,
      connectionParams: (async () => {
        // This is just because sometimes, injector seems to derp with the authFacade instance
        let idToken = await authFacade.getIdTokenResult();
        // If we're at least 5 minutes from expiration, refresh token
        if (Date.now() - new Date(idToken.expirationTime).getTime() < 60000) {
          idToken = await authFacade.getIdTokenResult(true);
        }
        return { headers: { Authorization: `Bearer ${idToken.token}` } };
      })()
    }
  });

  const httpL = httpLink.create({ uri: 'https://gubal.hasura.app/v1/graphql' });

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

  const httpLinkWithAuth = ApolloLink.from([httpAuth, httpL]);

  const link = split(
    // split based on operation type
    ({ query }) => {
      const { kind, operation } = getMainDefinition(query) as any;
      return kind === 'OperationDefinition' && operation === 'subscription';
    },
    ws,
    httpLinkWithAuth
  );
  return {
    link,
    cache: new InMemoryCache({
      addTypename: false
    })
  };
}
