import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { XivapiEndpoint, XivapiService } from '@xivapi/angular-client';
import { shareReplay } from 'rxjs/operators';

@Injectable()
export class TooltipDataService {

  private actions: { [index: number]: Observable<any> } = {};
  private items: { [index: number]: Observable<any> } = {};

  constructor(private translator: TranslateService, private xivapi: XivapiService) {
  }

  getItemTooltipData(id: number): Observable<any> {
    if (this.items[id] === undefined) {
      this.items[id] = this.xivapi.get(XivapiEndpoint.Item, id);
    }
    return this.items[id];
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
