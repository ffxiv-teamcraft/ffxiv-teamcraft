import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PlatformService } from '../../../core/tools/platform.service';
import { fromEvent } from 'rxjs';
import { auditTime, delay, distinctUntilChanged, map, startWith, takeUntil } from 'rxjs/operators';
import { TeamcraftComponent } from '../../../core/component/teamcraft-component';

declare const tyche: any;

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
      (<any>window).tyche = {
        mode: 'tyche',
        config: `https://config.playwire.com/1024627/v2/websites/${this.platform.isDesktop() ? 73554 : 73498}/banner.json`,
        passiveMode: true,
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
      const tycheCDNScript = document.createElement('script');
      tycheCDNScript.id = 'tyche';
      tycheCDNScript.async = true;
      tycheCDNScript.setAttribute('src', 'https://cdn.intergi.com/hera/tyche.js');
      document.head.appendChild(tycheCDNScript);
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
    tyche.changePath('no-ads');
    tyche.destroyUnits('all');
  }

  private enableDesktopAd(): void {
    tyche.destroyUnits('all');
    tyche.settings.device = 'desktop';
    tyche.isMobile = false;
    tyche.changePath('ROS');
    tyche.addUnits([{
      selectorId: 'pwAdBanner',
      type: 'leaderboard_atf'
    }]).then(() => {
      tyche.displayUnits();
    });
  }

  private enableMobileAd(): void {
    tyche.destroyUnits('all');
    tyche.settings.device = 'mobile';
    tyche.isMobile = true;
    tyche.changePath('mobile-ad');
    tyche.addUnits([{
      selectorId: 'pwAdBanner',
      type: 'leaderboard_atf'
    }]).then(() => {
      tyche.displayUnits();
    });
  }

}
