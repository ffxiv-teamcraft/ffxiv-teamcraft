import { Directive, HostListener, Input } from '@angular/core';
import { AnalyticsService } from './analytics.service';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[fathomEvent]'
})
export class FathomEventDirective {

  @Input('fathomEvent')
  code: string;

  @HostListener('click')
  onClick(): void {
    this.analyticsService.event(this.code);
  }

  constructor(private analyticsService: AnalyticsService) {
  }

}
