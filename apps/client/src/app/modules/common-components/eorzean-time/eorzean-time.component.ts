import { Component, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-eorzean-time',
  templateUrl: './eorzean-time.component.html',
  styleUrls: ['./eorzean-time.component.scss']
})
export class EorzeanTimeComponent {

  @Input()
  date: Date;

  constructor(private translator: TranslateService) {
  }

  getDateString(): string {
    const format = localStorage.getItem('etime:format') || this.getDefaultFormat();
    const minutes = this.date.getUTCMinutes();
    let hours = this.date.getUTCHours();
    let suffix = '';
    if (format === '12') {
      suffix = hours > 12 ? 'PM' : 'AM';
      hours = hours % 12;
    }
    return `${hours}:${minutes < 10 ? 0 : ''}${minutes}${suffix}`;
  }

  /**
   * Gets the default format based on the locale.
   * @returns {string}
   */
  getDefaultFormat(): string {
    return this.translator.currentLang === 'fr' ? '24' : '12';
  }

  switchFormat(): void {
    const format = localStorage.getItem('etime:format') || this.getDefaultFormat();
    localStorage.setItem('etime:format', format === '12' ? '24' : '12');
  }
}
