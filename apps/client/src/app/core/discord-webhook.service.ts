import { HttpClient } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { Injectable } from '@angular/core';

@Injectable()
export class DiscordWebhookService {

  constructor(private http: HttpClient, private translate: TranslateService) {
  }

  sendMessage(hook: string, translateKey: string, translateParams: Object): void {
    this.http.post(hook, { content: this.translate.instant(translateKey, translateParams) }).subscribe();
  }
}
