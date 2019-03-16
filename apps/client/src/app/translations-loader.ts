import { HttpClient } from '@angular/common/http';
import { TranslateLoader } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { PlatformService } from './core/tools/platform.service';


export class TranslationsLoader implements TranslateLoader {

  constructor(private http: HttpClient, private platformService: PlatformService) {
  }

  getTranslation(lang: string): Observable<any> {
    return this.http.get(`${this.platformService.isDesktop() ? '.' : ''}/assets/i18n/${this.getFilename(lang)}.json`).pipe(shareReplay(1));
  }

  getFilename(lang: string): string {
    switch (lang) {
      case 'de':
        return 'de-DE';
      case 'es':
        return 'es-ES';
      case 'fr':
        return 'fr-FR';
      case 'ja':
        return 'ja-JP';
      case 'ko':
        return 'ko-KR';
      case 'pt':
        return 'pt-PT';
      case 'br':
        return 'pt-BR';
      case 'zh':
        return 'zh-CN';
      case 'ru':
        return 'ru-RU';
      default:
        return 'en';
    }
  }
}

export function TranslationsLoaderFactory(http: HttpClient, platformService: PlatformService): TranslateLoader {

  return new TranslationsLoader(http, platformService);
}
