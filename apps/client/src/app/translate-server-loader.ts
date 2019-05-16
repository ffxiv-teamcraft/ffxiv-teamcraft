import { Observable } from 'rxjs';
import { TranslateLoader } from '@ngx-translate/core';

declare var require: any;

const fs = require('fs');

export class TranslateServerLoader implements TranslateLoader {

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

  /**
   * Gets the translations from the server
   * @param lang
   * @returns {any}
   */
  public getTranslation(lang: string): Observable<any> {
    console.log('GET TRANSLATION !!!');
    return new Observable(observer => {
      observer.next(JSON.parse(fs.readFileSync(`i18n/${this.getFilename(lang)}.json`, 'utf8')));
      observer.complete();
    });
  }
}
