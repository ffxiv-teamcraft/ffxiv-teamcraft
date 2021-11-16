import { Component, OnDestroy, OnInit } from '@angular/core';
import { SeoService } from './seo.service';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SeoMetaConfig } from './seo-meta-config';

@Component({
  template: ''
})
export abstract class SeoPageComponent implements OnDestroy, OnInit {

  private seoOnDestroy$ = new Subject<void>();

  protected constructor(protected seoService: SeoService) {
  }

  ngOnDestroy(): void {
    this.seoOnDestroy$.next();
    this.seoService.resetConfig();
  }

  ngOnInit(): void {
    this.getSeoMeta().pipe(
      takeUntil(this.seoOnDestroy$)
    ).subscribe((config: Partial<SeoMetaConfig>) => {
      this.seoService.setConfig(config);
    });
  }

  protected abstract getSeoMeta(): Observable<Partial<SeoMetaConfig>>;
}
