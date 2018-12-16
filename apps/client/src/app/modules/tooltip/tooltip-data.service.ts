import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { XivapiEndpoint, XivapiService } from '@xivapi/angular-client';
import { map, shareReplay, switchMap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Injectable()
export class TooltipDataService {

  private static readonly LODESTONE_LANGUAGES = ['na', 'fr', 'ja', 'de'];

  private actions: { [index: number]: Observable<any> } = {};

  constructor(private translator: TranslateService, private xivapi: XivapiService,
              private http: HttpClient, private sanitizer: DomSanitizer) {
  }

  getItemTooltipData(id: number): Observable<SafeHtml> {
    return this.xivapi.getMarketBoardItem('Louisoix', id).pipe(
      map(item => item.Lodestone.LodestoneId),
      switchMap((lodestoneId) => {
        let lodestoneLanguage = 'na';
        if (TooltipDataService.LODESTONE_LANGUAGES.indexOf(this.translator.currentLang) > -1) {
          lodestoneLanguage = this.translator.currentLang;
        }
        return this.http.get(`https://us-central1-ffxivteamcraft.cloudfunctions.net/lodestone-api?url=https://${lodestoneLanguage
          }.finalfantasyxiv.com/lodestone/playguide/db/item/${lodestoneId
          }/jsonp/`, { responseType: 'text' }).pipe(
          map(response => {
            let content = response.substr(16);
            content = content.substr(0, content.length - 1);
            return this.sanitizer.bypassSecurityTrustHtml(JSON.parse(content).html);
          })
        );
      })
    );
  }

  getActionTooltipData(id: number): Observable<any> {
    if (this.actions[id] === undefined) {
      if (id > 99999) {
        this.actions[id] = this.xivapi.get(XivapiEndpoint.CraftAction, id).pipe(shareReplay(1));
      } else {
        this.actions[id] = this.xivapi.get(XivapiEndpoint.Action, id).pipe(shareReplay(1));
      }
    }
    return this.actions[id];
  }
}
