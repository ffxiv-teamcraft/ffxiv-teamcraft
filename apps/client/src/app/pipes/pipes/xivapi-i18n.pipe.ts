import { Inject, Pipe, PipeTransform, PLATFORM_ID } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { isPlatformServer } from '@angular/common';

@Pipe({
  name: 'xivapiI18n',
  pure: false
})
export class XivapiI18nPipe implements PipeTransform {

  constructor(private translate: TranslateService, private sanitizer: DomSanitizer,
              private activatedRoute: ActivatedRoute, @Inject(PLATFORM_ID) private platform: Object) {
  }

  transform(value: any, fieldName = 'Name', sanitized = false): SafeHtml {
    let lang = this.translate.currentLang;
    if (isPlatformServer(this.platform) && this.activatedRoute.snapshot.paramMap.get('language')) {
      lang = this.activatedRoute.snapshot.paramMap.get('language');
      console.log('LANG FROM URL', lang);
    }
    const name = value[`${fieldName}_${lang}`] || value[`${fieldName}_en`];
    if (sanitized) {
      return this.sanitizer.bypassSecurityTrustHtml(name);
    }
    return name;
  }
}
