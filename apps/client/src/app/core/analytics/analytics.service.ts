import { Injectable } from '@angular/core';
import { PlatformService } from '../tools/platform.service';
import { IpcService } from '../electron/ipc.service';
import { TranslateService } from '@ngx-translate/core';

declare const gtag: Function;

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {

  private static readonly GA4_ID = 'G-RNVD9NJW4N';

  private static readonly GA3_ID = 'UA-104948571-1';

  private static readonly FATHOM_ID = 'TNSXKFPS';

  constructor(private platformService: PlatformService, private ipc: IpcService,
              private translate: TranslateService) {
    this.initFathom(this.platformService.isDesktop());
    if (this.platformService.isDesktop()) {
      (window as any).fathomHost = 'https://ffxivteamcraft.app';
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

  private initFathom(desktop: boolean): void {
    if (document.getElementById('fathom') !== null) {
      return;
    }
    const script = document.createElement('script');
    script.setAttribute('id', 'fathom');
    script.setAttribute('src', './assets/fathom.js');
    script.setAttribute('data-site', AnalyticsService.FATHOM_ID);
    script.setAttribute('data-spa', 'auto');
    script.setAttribute('data-tracker-url', 'https://beard-genuine.ffxivteamcraft.com/');
    script.setAttribute('data-excluded-domains', 'localhost');
    if (desktop) {
      script.setAttribute('data-host', 'https://ffxivteamcraft.electron');
    }
    document.head.appendChild(script);
  }

  public pageView(url: string): void {
    if (this.platformService.isDesktop()) {
      this.ipc.send('analytics:pageView', url);
    } else {
      gtag('set', 'page', url);
      gtag('send', 'pageview');
    }
  }
}
