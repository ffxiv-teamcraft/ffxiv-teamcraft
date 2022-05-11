import { APP_BOOTSTRAP_LISTENER, ComponentRef, Provider } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { AnalyticsService } from './analytics.service';
import { filter, skip } from 'rxjs/operators';


export const GOOGLE_ANALYTICS_ROUTER_INITIALIZER_PROVIDER: Provider = {
  provide: APP_BOOTSTRAP_LISTENER,
  multi: true,
  useFactory: AnalyticsRouterInitializer,
  deps: [
    AnalyticsService
  ]
};

// adapted from https://github.com/maxandriani/ngx-google-analytics/blob/master/projects/ngx-google-analytics/src/lib/initializers/google-analytics-router.initializer.ts

export function AnalyticsRouterInitializer(
  analytics: AnalyticsService
) {
  return async (c: ComponentRef<any>) => {
    const router = c.injector.get(Router);
    const subs = router
      .events
      .pipe(
        filter((event: NavigationEnd) => event instanceof NavigationEnd),
        skip(1) // Prevent double views on the first trigger (because GA Already send one ping on setup)
      )
      .subscribe(event => analytics.pageView(event.urlAfterRedirects));
    // Cleanup
    c.onDestroy(() => subs.unsubscribe());
  };
}
