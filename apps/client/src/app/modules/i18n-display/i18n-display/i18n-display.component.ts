import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';
import { Observable, of } from 'rxjs';
import { I18nName } from '../../../model/common/i18n-name';
import { I18nNameLazy } from '../../../model/common/i18n-name-lazy';

@Component({
  selector: 'app-i18n-display',
  templateUrl: './i18n-display.component.html',
  styleUrls: ['./i18n-display.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class I18nDisplayComponent implements OnChanges {
  /**
   * I18nName to display
   */
  @Input()
  value: I18nName | I18nNameLazy;

  languages = [];

  ngOnChanges(changes) {
    if (changes.value) {
      const value = changes.value.currentValue;
      this.languages = [
        { key: 'en', icon: 'english' },
        { key: 'de', icon: 'german' },
        { key: 'fr', icon: 'french' },
        { key: 'ja', icon: 'japanese' },
        { key: 'zh', icon: 'chinese' },
        { key: 'ko', icon: 'korean' }
      ].filter(({ key }) => value && value[key]);
    }
  }

  getValue({ key }): Observable<string> {
    if (!this.value || !this.value[key]) return of('');
    return typeof this.value[key] === 'string' ? of(this.value[key]) : this.value[key];
  }

  isExists({ key }) {
    return this.value && this.value[key];
  }
}
