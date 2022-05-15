import { Injectable } from '@angular/core';
import { PlatformService } from '../tools/platform.service';
import { IpcService } from '../electron/ipc.service';
import { TranslateService } from '@ngx-translate/core';

declare const gtag: Function;
declare const fathom: any;

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {

  private static readonly GA4_ID = 'G-RNVD9NJW4N';

  private static readonly GA3_ID = 'UA-104948571-1';

  constructor(private platformService: PlatformService, private ipc: IpcService,
              private translate: TranslateService) {
    if (this.platformService.isDesktop()) {
      this.ipc.send('analytics:init', {
        ga3: AnalyticsService.GA3_ID,
        ga4: AnalyticsService.GA4_ID,
        language: translate.currentLang
      });
    } else {
      gtag('config', AnalyticsService.GA3_ID);
      gtag('config', AnalyticsService.GA4_ID);

      gtag('js', new Date());

      gtag('set', 'user_properties', {
        'platform': 'web'
      });
    }
  }

  public pageView(url: string): void {
    if (this.platformService.isDesktop()) {
      this.ipc.send('analytics:pageView', url);
      fathom.trackPageview({
        url: url
      });
    } else {
      gtag('set', 'page', url);
      gtag('send', 'pageview');
    }
  }
}
