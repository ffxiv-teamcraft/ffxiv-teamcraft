import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';
import { I18nName } from '../../../model/common/i18n-name';

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
  value: I18nName;

  languages = []

  ngOnChanges(changes) {
    if (changes.value) {
      const value = changes.value.currentValue;
      this.languages = [
        { key: 'en', icon: 'english' },
        { key: 'de', icon: 'german' },
        { key: 'fr', icon: 'french' },
        { key: 'ja', icon: 'japanese' },
        { key: 'zh', icon: 'chinese' },
        { key: 'ko', icon: 'korean' },
      ].filter(({ key }) => value && value[key]);
    }
  }

  getValue({ key }) {
    if (!this.value) return '';
    return this.value[key] || '';
  }

  isExists({ key }) {
    return this.value && this.value[key];
  }
}
