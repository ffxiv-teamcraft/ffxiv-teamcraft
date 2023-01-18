import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PlatformService } from '../../../core/tools/platform.service';
import { fromEvent } from 'rxjs';
import { auditTime, delay, distinctUntilChanged, map, startWith, takeUntil } from 'rxjs/operators';
import { TeamcraftComponent } from '../../../core/component/teamcraft-component';

declare const ramp: any;
declare const gtag: any;

@Component({
  selector: 'app-ad',
  templateUrl: './ad.component.html',
  styleUrls: ['./ad.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdComponent extends TeamcraftComponent {

  constructor(private platform: PlatformService) {
    super();
    if (!this.platform.isOverlay()) {
      (<any>window)._pwGA4PageviewId = ''.concat(Date.now().toString());
      gtag(
        'event',
        'ramp_js',
        {
          'send_to': platform.isDesktop() ? 'G-0HS31QMFKW' : 'G-DBE6XPBFQS',
          'pageview_id': (<any>window)._pwGA4PageviewId
        }
      );
      (<any>window).ramp = {
        passiveMode: true,
        que: [],
        onReady: () => {
          fromEvent(window, 'resize')
            .pipe(
              map(event => (event.currentTarget as any).innerWidth),
              startWith(window.innerWidth),
              auditTime(1000),
              map(width => {
                if (width > 475 && width < 1350) {
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
      ramp.addUnits([{
        selectorId: 'pwAdBanner',
        type: 'leaderboard_btf2'
      }]);
      setTimeout(() => ramp.displayUnits(), 500);
    });
  }

  private enableMobileAd(): void {
    ramp.destroyUnits('all').then(() => {
      ramp.settings.device = 'mobile';
      ramp.isMobile = true;
      ramp.addUnits([{
        selectorId: 'pwAdBanner',
        type: '320x50_atf'
      }]).then(() => {
        ramp.displayUnits();
      });
    });
  }

}
