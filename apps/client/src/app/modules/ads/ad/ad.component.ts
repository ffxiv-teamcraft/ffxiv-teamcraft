import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
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
export class AdComponent extends TeamcraftComponent implements OnInit {

  public _unitType: string;

  constructor(private platform: PlatformService) {
    super();
    if (!this.platform.isOverlay()) {
      (<any>window).tyche = {
        mode: 'tyche',
        config: `https://config.playwire.com/1024627/v2/websites/${this.platform.isDesktop() ? 73554 : 73498}/banner.json`,
        passiveMode: true
      };
      const tycheCDNScript = document.createElement('script');
      tycheCDNScript.id = 'tyche';
      tycheCDNScript.async = true;
      tycheCDNScript.setAttribute('src', 'https://cdn.intergi.com/hera/tyche.js');
      document.head.appendChild(tycheCDNScript);
    }
  }

  ngOnInit(): void {
    fromEvent(window, 'resize')
      .pipe(
        map(event => (event.currentTarget as any).innerWidth),
        startWith(window.innerWidth),
        auditTime(1000),
        delay(3000), // Arbitrary delay to have enough time for tyche to load, should use onReady instead
        map(width => {
          if (width > 475 && width < 1350) {
            return 'mobile';
          } else if (width >= 350) {
            return 'desktop';
          }
          return null;
        }),
        distinctUntilChanged(),
        takeUntil(this.onDestroy$)
      )
      .subscribe((platform) => {
        this.removeAd();
        console.log('Loading ad for platform', platform);
        switch (platform) {
          case 'mobile':
            this.enableMobileAd();
            break;
          case 'desktop':
            this.enableDesktopAd();
            break;
        }
      });
  }

  private removeAd(): void {
    tyche.changePath('no-ads');
  }

  private enableDesktopAd(): void {
    tyche.changePath('ROS');
    tyche.settings.device = 'desktop';
    tyche.isMobile = false;
  }

  private enableMobileAd(): void {
    tyche.changePath('mobile-ad');
    tyche.settings.device = 'mobile';
    tyche.isMobile = true;
  }

}
