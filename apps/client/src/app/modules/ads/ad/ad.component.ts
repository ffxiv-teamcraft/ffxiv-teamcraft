import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, Input, OnDestroy, ViewChild } from '@angular/core';
import { PlatformService } from '../../../core/tools/platform.service';
import { filter } from 'rxjs/operators';
import { NavigationEnd, Router } from '@angular/router';

declare const tyche: any;

@Component({
  selector: 'app-ad',
  templateUrl: './ad.component.html',
  styleUrls: ['./ad.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdComponent implements AfterViewInit, OnDestroy {

  @ViewChild('vmAdRef', { static: false })
  vmAdRef: ElementRef;

  private loaded = false;

  constructor(private platform: PlatformService, router: Router) {
    router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe(() => {
      this.removeAd();
      this.addAd();
    });

    if (!this.platform.isOverlay()) {
      (<any>window).tyche = {
        mode: 'tyche',
        config: `https://config.playwire.com/1024627/v2/websites/${this.platform.isDesktop() ? 73554 : 73498}/banner.json`,
        passiveMode: true,
        onReady: () => {
          console.log('TYCHE READY !');
          tyche.addUnits([{
            selectorId: 'pwAdBanner',
            type: 'leaderboard_atf'
          }]).then(() => {
            tyche.displayUnits();
          }).catch((e) => {
            tyche.displayUnits();
            console.error('TYCHE ERROR', e);
          });
        }
      };
    }
  }

  private _placementId: string;

  public get placementId(): string {
    return this._placementId;
  }

  @Input()
  public set placementId(id: string) {
    if (this.loaded) {
      this.removeAd();
      this._placementId = id;
      if (id !== null) {
        this.addAd();
      }
    } else {
      this._placementId = id;
    }
  }

  ngAfterViewInit(): void {
    if (!this.platform.isOverlay()) {
      // Tyche
      const tycheCDNScript = document.createElement('script');
      tycheCDNScript.id = 'tyche';
      tycheCDNScript.setAttribute('src', 'https://cdn.intergi.com/hera/tyche.js');
      document.head.appendChild(tycheCDNScript);


      // // Ramp
      (<any>window).ramp = (<any>window).ramp || {};
      (<any>window).ramp.que = (<any>window).ramp.que || [];
      const pwScript = document.createElement('script');
      pwScript.setAttribute('src', `https://cdn.intergient.com/1024627/${this.platform.isDesktop() ? 73554 : 73498}/ramp_config.js`);
      document.head.appendChild(pwScript);
      const adScript = document.createElement('script');
      adScript.setAttribute('src', 'https://cdn.intergient.com/ramp_core.js');
      document.body.appendChild(adScript);
    }
    this.addAd();
    this.loaded = true;
  }

  ngOnDestroy(): void {
    this.removeAd();
  }

  private addAd(): void {
    if (!this.platform.isDesktop()) {
      if (this.placementId) {
        (window as any).top.__vm_add = (window as any).top.__vm_add || [];
        (window as any).top.__vm_add.push(this.vmAdRef.nativeElement);
      }
    }
  }

  private removeAd(): void {
    if (!this.platform.isDesktop()) {
      (window as any).top.__vm_remove = (window as any).top.__vm_remove || [];
      (window as any).top.__vm_remove.push(this.vmAdRef.nativeElement);
    }
  }

}
