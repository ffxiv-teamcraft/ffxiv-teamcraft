import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
  name: 'timer',
  pure: true
})
export class TimerPipe implements PipeTransform {

  constructor(private translate: TranslateService) {
  }

  transform(duration: number, verbose = false): string {
    const seconds = duration % 60;
    const minutes = Math.floor(duration / 60) % 60;
    const hours = Math.floor(duration / 3600) % 24;
    const days = Math.floor(duration / 86400);
    const secondsString = `${seconds < 10 ? 0 : ''}${seconds}`;
    const minutesString = `${minutes < 10 ? 0 : ''}${minutes}`;
    const hoursString = `${hours < 10 ? 0 : ''}${hours}`;
    const daysString = `${days}`;
    if (verbose) {
      return `${days > 0 ? daysString + this.translate.instant(days > 1 ? 'TIMERS.Days' : 'TIMERS.Day') : ''} ${hoursString}${this.translate.instant('TIMERS.Hours')} ${minutesString}${this.translate.instant('TIMERS.Minutes')} ${secondsString}${this.translate.instant('TIMERS.Seconds')}`;
    } else {
      return `${days > 0 ? daysString + ':' : ''}${(hours > 0 || days > 0) ? hoursString + ':' : ''}${minutesString}:${secondsString}`;
    }
  }

}
