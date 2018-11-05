import { HttpClient } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { Injectable } from '@angular/core';
import { I18nToolsService } from './tools/i18n-tools.service';
import { first, switchMap } from 'rxjs/operators';

@Injectable()
export class DiscordWebhookService {

  constructor(private http: HttpClient, private translate: TranslateService,
              private i18n: I18nToolsService) {
  }

  sendMessage(hook: string, translateKey: string, translateParams?: Object, language = this.translate.currentLang): void {
    this.i18n.getTranslation(translateKey, language, translateParams).pipe(
      switchMap(translatedNotification => {
        return this.http.post(hook, { content: translatedNotification });
      }),
      first()
    ).subscribe();
  }
}
