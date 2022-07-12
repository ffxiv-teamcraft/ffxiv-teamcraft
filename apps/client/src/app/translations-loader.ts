import { HttpClient } from '@angular/common/http';
import { TranslateLoader } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { PlatformService } from './core/tools/platform.service';
import { isPlatformServer } from '@angular/common';
import { environment } from '../environments/environment';

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

export class TranslationsLoader implements TranslateLoader {

  constructor(private http: HttpClient,
              private platformService: PlatformService,
              private platform: any) {
  }

  public getTranslation(lang: string): Observable<any> {
    if (isPlatformServer(this.platform)) {
      return this.http.get(`${environment.ssrHost}/assets/i18n/${getFilename(lang)}.json`).pipe(shareReplay({ bufferSize: 1, refCount: true }));
    } else if (this.platformService.isDesktop() || !environment.production) {
      return this.http.get(`./assets/i18n/${getFilename(lang)}.json`).pipe(shareReplay({ bufferSize: 1, refCount: true }));
    } else {
      return this.http.get(`https://cdn.ffxivteamcraft.com/assets/i18n/${getFilename(lang)}.json`).pipe(shareReplay({ bufferSize: 1, refCount: true }));
    }
  }
}

export function TranslationsLoaderFactory(http: HttpClient, platform: any, platformService: PlatformService): TranslateLoader {
  return new TranslationsLoader(http, platformService, platform);
}
