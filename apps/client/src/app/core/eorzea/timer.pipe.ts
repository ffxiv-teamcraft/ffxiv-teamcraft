import { Pipe, PipeTransform, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { EorzeanTimeService } from './eorzean-time.service';

@Pipe({
    name: 'timer',
    pure: true,
    standalone: true
})
export class TimerPipe implements PipeTransform {
  private etime = inject(EorzeanTimeService);


  transform(duration: number, verbose = false): string {
    return this.etime.toStringTimer(duration, verbose);
  }

}
