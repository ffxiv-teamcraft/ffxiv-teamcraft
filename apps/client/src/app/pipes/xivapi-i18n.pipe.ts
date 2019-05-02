import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'xivapiI18n',
  pure: true
})
export class XivapiI18nPipe implements PipeTransform {

  constructor(private translate: TranslateService, private sanitizer: DomSanitizer) {
  }

  transform(value: any, fieldName = 'Name', sanitized = false): SafeHtml {
    const name = value[`${fieldName}_${this.translate.currentLang}`] || value[`${fieldName}_en`];
    if (sanitized) {
      return this.sanitizer.bypassSecurityTrustHtml(name);
    }
    return name;
  }
}
