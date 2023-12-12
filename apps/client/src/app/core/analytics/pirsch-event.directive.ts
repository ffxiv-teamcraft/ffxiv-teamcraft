import { Directive, HostListener, Input } from '@angular/core';
import { AnalyticsService } from './analytics.service';
import { Scalar } from 'pirsch-sdk';

@Directive({
    // eslint-disable-next-line @angular-eslint/directive-selector
    selector: '[pirschEvent]',
    standalone: true
})
export class PirschEventDirective {

  @Input('pirschEvent')
  code: string;

  @Input()
  meta?: Record<string, Scalar>;

  @HostListener('click')
  onClick(): void {
    if (this.meta && typeof this.meta !== 'object') {
      console.error('[Pirsch] Refusing to send non-object meta');
      this.analyticsService.event(this.code);
    } else {
      this.analyticsService.event(this.code, this.meta);
    }
  }

  constructor(private analyticsService: AnalyticsService) {
  }

}
