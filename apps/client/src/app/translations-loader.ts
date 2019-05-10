import { HttpClient } from '@angular/common/http';
import { TranslateLoader } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { PlatformService } from './core/tools/platform.service';
import { isPlatformBrowser } from '@angular/common';
import * as translationDE from '../assets/i18n/de-DE.json';
import * as translationES from '../assets/i18n/es-ES.json';
import * as translationFR from '../assets/i18n/fr-FR.json';
import * as translationJA from '../assets/i18n/ja-JP.json';
import * as translationKO from '../assets/i18n/ko-KR.json';
import * as translationPT from '../assets/i18n/pt-PT.json';
import * as translationBR from '../assets/i18n/pt-BR.json';
import * as translationZH from '../assets/i18n/zh-CN.json';
import * as translationRU from '../assets/i18n/ru-RU.json';
import * as translationEN from '../assets/i18n/en.json';

export function getFilename(lang: string): string {
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

const TRANSLATIONS = {
  DE: translationDE,
  ES: translationES,
  FR: translationFR,
  JA: translationJA,
  KO: translationKO,
  PT: translationPT,
  BR: translationBR,
  ZH: translationZH,
  RU: translationRU,
  EN: translationEN
};

export class JSONModuleLoader implements TranslateLoader {
  getTranslation(lang: string): Observable<any> {
    return of(TRANSLATIONS[lang.toUpperCase()]);
  }
}

export class TranslationsLoader implements TranslateLoader {

  constructor(private http: HttpClient,
              private platformService: PlatformService) {
  }

  public getTranslation(lang: string): Observable<any> {
    return this.http.get(`${this.platformService.isDesktop() ? '.' : ''}/assets/i18n/${getFilename(lang)}.json`).pipe(shareReplay(1));
  }
}

export function TranslationsLoaderFactory(http: HttpClient, platform: any, platformService: PlatformService): TranslateLoader {
  if (isPlatformBrowser(platform)) {
    return new TranslationsLoader(http, platformService);
  } else {
    return new JSONModuleLoader();
  }
}
