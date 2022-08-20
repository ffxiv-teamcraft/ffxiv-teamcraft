import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { PlatformService } from '../../../core/tools/platform.service';

declare const tyche: any;

@Component({
  selector: 'app-ad',
  templateUrl: './ad.component.html',
  styleUrls: ['./ad.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdComponent {

  private ready = false;

  public _unitType: string;

  @Input()
  set unitType(type: string) {
    this._unitType = type;
    this.refreshAd();
  }

  constructor(private platform: PlatformService) {
    if (!this.platform.isOverlay()) {
      (<any>window).tyche = {
        mode: 'tyche',
        config: `https://config.playwire.com/1024627/v2/websites/${this.platform.isDesktop() ? 73554 : 73498}/banner.json`,
        passiveMode: false,
        onReady: () => {
          this.ready = true;
          this.refreshAd();
        }
      };
      // Ramp
      const tycheCDNScript = document.createElement('script');
      tycheCDNScript.id = 'tyche';
      tycheCDNScript.async = true;
      tycheCDNScript.setAttribute('src', 'https://cdn.intergi.com/hera/tyche.js');
      document.head.appendChild(tycheCDNScript);
    }
  }

  private refreshAd(): void {
    if (!this.ready) {
      return;
    }
    tyche.destroyUnits('all');
    if (this._unitType) {
      tyche.addUnits([{
        selectorId: 'pw-ad-banner',
        type: this._unitType
      }]).then(() => {
        tyche.displayUnits();
      });
    }
  }

}
