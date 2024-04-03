import { Component, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { SeoPageComponent } from '../seo/seo-page-component';

@Component({
  template: ''
})
export abstract class SeoTeamcraftComponent extends SeoPageComponent implements OnDestroy {
  protected onDestroy$: Subject<void> = new Subject<void>();

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }
}
