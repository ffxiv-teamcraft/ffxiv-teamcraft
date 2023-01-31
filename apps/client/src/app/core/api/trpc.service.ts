import { Injectable } from '@angular/core';
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '@ffxiv-teamcraft/trpc-api';
import { from, Observable } from 'rxjs';
import superjson from 'superjson';

@Injectable({ providedIn: 'root' })
export class TrpcService {
  private trpc = createTRPCProxyClient<AppRouter>({
    links: [
      httpBatchLink({
        url: 'http://localhost:3000/trpc'
      })
    ],
    transformer: superjson
  });

  public search(query: string, filters: any[]): Observable<any> {
    return from(this.trpc.doSearch.query({
      query, filters
    }));
  }
}
