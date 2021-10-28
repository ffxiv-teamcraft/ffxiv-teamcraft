import { Pipe, PipeTransform } from '@angular/core';
import { fromEvent, Subscription } from 'rxjs';
import { auditTime, map, startWith } from 'rxjs/operators';

@Pipe({
  name: 'widthBreakpoints',
  pure: false
})
export class WidthBreakpointsPipe<T> implements PipeTransform {
  private currentValue?: T;
  private sub?: Subscription;
  private input?: Record<number, T> & { default: T };

  transform(config: Record<number, T> & { default: T }): T {
    if (config !== this.input) {
      this.sub?.unsubscribe();
      const keys = Object.keys(config).filter(key => key !== 'default').map(key => +key).sort((a, b) => a - b);
      this.sub = fromEvent(window, 'resize')
        .pipe(
          auditTime(100),
          map(event => (event.currentTarget as any).innerWidth),
          startWith(window.innerWidth),
          map(width => {
            const matchingKey = keys.find(key => key > width);
            return config[matchingKey];
          })
        ).subscribe((result: T) => {
          this.currentValue = result;
        });
    }
    return this.currentValue === undefined ? config.default : this.currentValue;
  }

}
