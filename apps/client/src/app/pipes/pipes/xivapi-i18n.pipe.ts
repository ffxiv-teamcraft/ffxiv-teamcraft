import { Inject, Optional, Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { REQUEST } from '@nguniversal/express-engine/tokens';

@Pipe({
  name: 'xivapiI18n'
})
export class XivapiI18nPipe implements PipeTransform {

  constructor(private translate: TranslateService, private sanitizer: DomSanitizer,
              @Inject(REQUEST) @Optional() private request: any) {
  }

  transform(value: any, fieldName = 'Name', sanitized = false): SafeHtml {
    const lang = (this.request && this.request.lang) || this.translate.currentLang;
    const name = (value[`${fieldName}_${lang}`] || value[`${fieldName}_en`] || '').replace('', '•');
    if (sanitized) {
      return this.sanitizer.bypassSecurityTrustHtml(name);
    }
    return name;
  }
}
