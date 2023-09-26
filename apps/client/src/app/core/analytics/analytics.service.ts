import { Injectable } from '@angular/core';
import { PlatformService } from '../tools/platform.service';
import { IpcService } from '../electron/ipc.service';
import { TranslateService } from '@ngx-translate/core';
import { Pirsch, PirschWebClient } from 'pirsch-sdk/web';
import { environment } from '../../../environments/environment';
import { PirschBrowserHit, Scalar } from 'pirsch-sdk';
import { first, skip } from 'rxjs/operators';

declare const gtag: (...args: any[]) => void;

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {

  public static readonly GA4_ID = 'G-RNVD9NJW4N';

  private static readonly GA3_ID = 'UA-104948571-1';

  private pirsch: PirschWebClient;

  constructor(private platformService: PlatformService, private ipc: IpcService,
              translate: TranslateService) {
    this.initPirsch(this.platformService.isDesktop());
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

  private initPirsch(desktop: boolean): void {
    try {
      this.pirsch = new Pirsch({
        identificationCode: 'rfKDF2BBvfeaKFFLDuJVri1sV0zh5v4w',
        hostname: 'ffxivteamcraft.com'
      });
    } catch (e) {
      console.error('[Teamcraft] Pirsch Init has been blocked');
    }
    if (desktop) {
      this.ipc.pcapToggle$.pipe(
        // Skip default value as it's a behaviorSubject
        skip(1),
        first()
      ).subscribe(enabled => {
        this.event('init', { app: 'electron', version: environment.version, pcap: enabled });
      });
    } else {
      this.event('init', { app: 'web', version: environment.version, pcap: false });
    }
  }

  public pageView(url: string): void {
    this.pirschHit();
    if (this.platformService.isDesktop()) {
      this.ipc.send('analytics:pageView', url);
    } else {
      gtag('set', 'page', url);
      gtag('send', 'pageview');
    }
  }

  private generatePirschHit(): PirschBrowserHit {
    const hit = this.pirsch.hitFromBrowser();
    if (this.platformService.isDesktop()) {
      hit.url = `https://ffxivteamcraft.com${hit.url.split('#')[1] || '/'}`;
    }
    return hit;
  }

  private pirschHit(): void {
    if (environment.production) {
      try {
        this.pirsch.hit(this.generatePirschHit());
      } catch (e) {
        console.error('[Teamcraft] Pirsch API is blocked');
      }
    }
  }

  public event(code: string, meta?: Record<string, Scalar>): void {
    if (environment.production) {
      try {
        this.pirsch.event(code, 0, meta, this.generatePirschHit());
      } catch (e) {
        console.error('[Teamcraft] Pirsch API is blocked');
      }
    }
  }
}
