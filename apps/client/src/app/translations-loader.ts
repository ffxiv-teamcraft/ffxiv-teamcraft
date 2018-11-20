import { HttpClient } from '@angular/common/http';
import { TranslateLoader } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';


export function TranslationsLoaderFactory(http: HttpClient): TranslateLoader {

  return new TranslationsLoader(http);
}

export class TranslationsLoader implements TranslateLoader {

  constructor(private http: HttpClient) {
  }

  getTranslation(lang: string): Observable<any> {
    return this.http.get(`/assets/i18n/${this.getFilename(lang)}.json`).pipe(shareReplay(1));
  }

  getFilename(lang: string): string {
    switch (lang) {
      case'de':
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
        return 'br-BR';
      default:
        return 'en';
    }
  }
}
