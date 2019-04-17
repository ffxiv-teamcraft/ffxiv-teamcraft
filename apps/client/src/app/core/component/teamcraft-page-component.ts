import { SeoPageComponent } from '../seo/seo-page-component';
import { Subject } from 'rxjs';
import { OnDestroy } from '@angular/core';
import { SeoService } from '../seo/seo.service';

export abstract class TeamcraftPageComponent extends SeoPageComponent implements OnDestroy {
  protected onDestroy$: Subject<void> = new Subject<void>();

  protected constructor(protected seoService: SeoService) {
    super(seoService);
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
    super.ngOnDestroy();
  }
}
