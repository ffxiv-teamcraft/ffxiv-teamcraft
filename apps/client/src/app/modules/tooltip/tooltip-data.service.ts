import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { XivapiEndpoint, XivapiService } from '@xivapi/angular-client';
import { map, mergeMap, shareReplay } from 'rxjs/operators';
import { LazyDataService } from '../../core/data/lazy-data.service';

@Injectable()
export class TooltipDataService {

  private actions: { [index: number]: Observable<any> } = {};

  constructor(private translator: TranslateService, private xivapi: XivapiService,
              private lazyData: LazyDataService) {
  }

  getItemTooltipData(id: number): Observable<any> {
    return this.xivapi.get(XivapiEndpoint.Item, id).pipe(
      mergeMap((item) => {
        // If it's a  consumable, get item action details and put it inside item action itself.
        if (item.ItemAction && [844, 845, 846].indexOf(item.ItemAction.Type) > -1) {
          return this.xivapi.get(XivapiEndpoint.ItemFood, item.ItemAction.Data1).pipe(
            map(itemFood => {
              item.ItemFood = itemFood;
              return item;
            })
          );
        }
        return of(item);
      })
    );
  }

  getActionTooltipData(id: number): Observable<any> {
    if (this.actions[id] === undefined) {
      if (id > 99999) {
        this.actions[id] = this.xivapi.get(XivapiEndpoint.CraftAction, id).pipe(
          map(action => {
            if (this.lazyData.koJobCategories[action.ClassJobCategory.ID] && this.lazyData.koCraftDescriptions[id]) {
              action.ClassJobCategory.Name_ko = this.lazyData.koJobCategories[action.ClassJobCategory.ID].ko;
              action.Description_ko = this.lazyData.koCraftDescriptions[id].ko;
            }
            return action;
          }),
          shareReplay(1)
        );
      } else {
        this.actions[id] = this.xivapi.get(XivapiEndpoint.Action, id).pipe(
          map(action => {
            if (this.lazyData.koJobCategories[action.ClassJobCategory.ID] && this.lazyData.koCraftDescriptions[id]) {
              action.ClassJobCategory.Name_ko = this.lazyData.koJobCategories[action.ClassJobCategory.ID].ko;
              action.Description_ko = this.lazyData.koActionDescriptions[id].ko;
            }
            return action;
          }),
          shareReplay(1)
        );
      }
    }
    return this.actions[id];
  }
}
