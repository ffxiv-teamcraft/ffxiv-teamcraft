import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
    name: 'xivapiI18n',
    standalone: true,
})
export class XivapiI18nPipe implements PipeTransform {
  constructor(private translate: TranslateService, private sanitizer: DomSanitizer) {}

  transform(value: any, fieldName = 'Name', sanitized = false): SafeHtml {
    if (!value) {
      return '';
    }
    let lang = this.translate.currentLang;
    // xivapi uses chs instead of zh
    if (lang === 'zh') {
      lang = 'chs';
    }

    const name = (value[`${fieldName}_${lang}`] || value[`${fieldName}_en`] || '').replace('', '•');
    if (sanitized) {
      return this.sanitizer.bypassSecurityTrustHtml(name);
    }
    return name;
  }
}
