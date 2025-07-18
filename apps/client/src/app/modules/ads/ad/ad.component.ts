import { Component, inject } from '@angular/core';
import { PlatformService } from '../../../core/tools/platform.service';
import { auditTime, delay, distinctUntilChanged, filter, fromEvent, map, startWith, Subscription, takeUntil } from 'rxjs';
import { TeamcraftComponent } from '../../../core/component/teamcraft-component';
import { NavigationEnd, Router, RouterEvent } from '@angular/router';

declare const ramp: any;
declare const gtag: any;

@Component({
  selector: 'app-ad',
  templateUrl: './ad.component.html',
  styleUrls: ['./ad.component.less'],
  standalone: true
})
export class AdComponent extends TeamcraftComponent {

  private subscription: Subscription;

  private platform = inject(PlatformService);

  private router = inject(Router)

  constructor() {
    super();
    if (!this.platform.isOverlay()) {
      (<any>window)._pwGA4PageviewId = ''.concat(Date.now().toString());
      gtag(
        'event',
        'ramp_js',
        {
          'send_to': this.platform.isDesktop() ? 'G-0HS31QMFKW' : 'G-DBE6XPBFQS',
          'pageview_id': (<any>window)._pwGA4PageviewId
        }
      );
      this.router.events
        .pipe(
          filter((event) => {
            return event instanceof NavigationEnd;
          })
        )
        .subscribe((event: NavigationEnd) => {
          ramp.spaNewPage(event.url);
        });
      (<any>window).ramp = {
        passiveMode: true,
        que: [],
        onReady: () => {
          if (this.subscription) {
            this.subscription.unsubscribe();
            delete this.subscription;
          }
          this.subscription = fromEvent(window, 'resize')
            .pipe(
              map(event => (event.currentTarget as any).innerWidth),
              startWith(window.innerWidth),
              auditTime(1000),
              map(width => {
                if (width > 475 && width < 1150) {
                  return 'mobile';
                } else if (width >= 350) {
                  return 'desktop';
                }
                return null;
              }),
              distinctUntilChanged(),
              takeUntil(this.onDestroy$),
              delay(2000)
            )
            .subscribe((p) => {
              this.applyPlatform(p);
            });
        }
      };
      const ramp2CDNScript = document.createElement('script');
      ramp2CDNScript.async = true;
      ramp2CDNScript.setAttribute('src', `https://cdn.intergient.com/1024627/${this.platform.isDesktop() ? 73554 : 73498}/ramp.js`);
      document.head.appendChild(ramp2CDNScript);
    }
  }

  private applyPlatform(platform: string | null): void {
    switch (platform) {
      case 'mobile':
        this.enableMobileAd();
        break;
      case 'desktop':
        this.enableDesktopAd();
        break;
      default:
        this.removeAd();
        break;
    }
  }

  private removeAd(): void {
    ramp.changePath('no-ads');
    ramp.destroyUnits('all');
  }

  private enableDesktopAd(): void {
    ramp.destroyUnits('all').then(() => {
      ramp.settings.device = 'desktop';
      ramp.isMobile = false;
      ramp.spaAddAds([{
        selectorId: 'pwAdBanner',
        type: 'leaderboard_atf'
      }]);
      setTimeout(() => ramp.displayUnits(), 500);
    });
  }

  private enableMobileAd(): void {
    ramp.destroyUnits('all').then(() => {
      ramp.settings.device = 'mobile';
      ramp.isMobile = true;
      ramp.spaAddAds([{
        selectorId: 'pwAdBanner',
        type: '320x50_atf'
      }]).then(() => {
        ramp.displayUnits();
      });
    });
  }

}
