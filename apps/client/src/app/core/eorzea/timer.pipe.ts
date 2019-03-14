import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timer',
  pure: true
})
export class TimerPipe implements PipeTransform {

  transform(duration: number): string {
    const seconds = duration % 60;
    const minutes = Math.floor(duration / 60);
    return `${minutes}:${seconds < 10 ? 0 : ''}${seconds}`;
  }

}
