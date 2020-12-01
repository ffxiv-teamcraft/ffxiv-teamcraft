import { SeoPageComponent } from '../seo/seo-page-component';
import { Subject } from 'rxjs';
import { Component, OnDestroy } from '@angular/core';
import { SeoService } from '../seo/seo.service';

@Component({
  template: ''
})
export abstract class TeamcraftPageComponent extends SeoPageComponent implements OnDestroy {
  protected onDestroy$: Subject<void> = new Subject<void>();

  protected constructor(protected seoService: SeoService) {
    super(seoService);
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
    super.ngOnDestroy();
  }
}
