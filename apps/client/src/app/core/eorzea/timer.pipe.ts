import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
  name: 'timer',
  pure: true
})
export class TimerPipe implements PipeTransform {

  constructor(private translate: TranslateService){}

  transform(duration: number): string {
    // 259200 is 3 days, we'll display a specific timer for that because of weather transition accuracy issues
    if (duration > 259200) {
      return this.translate.instant('ALARMS.More_than_three_days');
    }
    const seconds = duration % 60;
    const minutes = Math.floor(duration / 60) % 60;
    const hours = Math.floor(duration / 3600) % 24;
    const days = Math.floor(duration / 86400);
    return `${days > 0 ? days + ':' : ''}${hours > 0 ? hours + ':' : ''}${minutes}:${seconds < 10 ? 0 : ''}${seconds}`;
  }

}
