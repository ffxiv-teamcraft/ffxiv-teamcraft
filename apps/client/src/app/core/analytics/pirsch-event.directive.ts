import {Directive, HostListener, Input} from '@angular/core';
import {AnalyticsService} from './analytics.service';
import {Scalar} from "pirsch-sdk";

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[pirschEvent]'
})
export class PirschEventDirective {

  @Input('pirschEvent')
  code: string;

  @Input()
  meta?: Record<string, Scalar>;

  @HostListener('click')
  onClick(): void {
    this.analyticsService.event(this.code, this.meta);
  }

  constructor(private analyticsService: AnalyticsService) {
  }

}
