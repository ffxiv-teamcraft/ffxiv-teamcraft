import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, Input, OnDestroy, ViewChild } from '@angular/core';
import { PlatformService } from '../../../core/tools/platform.service';
import { filter } from 'rxjs/operators';
import { NavigationEnd, Router } from '@angular/router';

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
    if (!this.platform.isDesktop()) {
      this.addAd();
      this.loaded = true;
    }
  }

  ngOnDestroy(): void {
    this.removeAd();
  }

  private addAd(): void {
    if (this.placementId) {
      (window as any).top.__vm_add = (window as any).top.__vm_add || [];
      (window as any).top.__vm_add.push(this.vmAdRef.nativeElement);
    }
  }

  private removeAd(): void {
    (window as any).top.__vm_remove = (window as any).top.__vm_remove || [];
    (window as any).top.__vm_remove.push(this.vmAdRef.nativeElement);
  }

}
