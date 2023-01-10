import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { EorzeanTimeService } from './eorzean-time.service';

@Pipe({
  name: 'timer',
  pure: true
})
export class TimerPipe implements PipeTransform {

  constructor(private etime: EorzeanTimeService) {
  }

  transform(duration: number, verbose = false): string {
    return this.etime.toStringTimer(duration, verbose);
  }

}
