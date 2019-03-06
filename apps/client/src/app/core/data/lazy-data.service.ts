import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class LazyDataService {

  public loaded$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  public items: any = {};

  public zhItems: any = {};

  public koItems: any = {};
  public koActions: any = {};
  public koActionDescriptions: any = {};
  public koCraftActions: any = {};
  public koCraftDescriptions: any = {};
  public koFCActions: any = {};
  public koLeves: any = {};
  public koWeathers: any = {};
  public koPlaces: any = {};
  public koNpcs: any = {};
  public koMobs: any = {};
  public koJobNames: any = {};
  public koJobAbbrs: any = {};
  public koJobCategories: any = {};

  public craftActions: any = {};

  public actions: any = {};

  constructor(private http: HttpClient) {
    combineLatest(
      this.http.get('./assets/data/items.json'),
      this.http.get('./assets/data/zh-items.json'),
      this.http.get('./assets/data/ko/ko-items.json'),
      this.http.get('./assets/data/ko/ko-actions.json'),
      this.http.get('./assets/data/ko/ko-action-descriptions.json'),
      this.http.get('./assets/data/ko/ko-craft-actions.json'),
      this.http.get('./assets/data/ko/ko-craft-descriptions.json'),
      this.http.get('./assets/data/ko/ko-free-company-actions.json'),
      this.http.get('./assets/data/ko/ko-leves.json'),
      this.http.get('./assets/data/ko/ko-weathers.json'),
      this.http.get('./assets/data/ko/ko-places.json'),
      this.http.get('./assets/data/ko/ko-npcs.json'),
      this.http.get('./assets/data/ko/ko-mobs.json'),
      this.http.get('./assets/data/ko/ko-job-name.json'),
      this.http.get('./assets/data/ko/ko-job-abbr.json'),
      this.http.get('./assets/data/ko/ko-job-category.json'),
      this.http.get('./assets/data/actions.json'),
      this.http.get('./assets/data/craft-actions.json')
    ).subscribe(([
                   items,
                   zhItems,
                   koItems,
                   koActions,
                   koActionDescriptions,
                   koCraftActions,
                   koCraftDescriptions,
                   koFCActions,
                   koLeves,
                   koWeathers,
                   koPlaces,
                   koNpcs,
                   koMobs,
                   koJobNames,
                   koJobAbbrs,
                   koJobCategories,
                   actions,
                   craftActions
                 ]) => {
      this.items = items;
      this.zhItems = zhItems;
      this.koItems = koItems;
      this.koActions = koActions;
      this.koActionDescriptions = koActionDescriptions;
      this.koCraftActions = koCraftActions;
      this.koCraftDescriptions = koCraftDescriptions;
      this.koFCActions = koFCActions;
      this.koLeves = koLeves;
      this.koWeathers = koWeathers;
      this.koPlaces = koPlaces;
      this.koNpcs = koNpcs;
      this.koMobs = koMobs;
      this.koJobNames = koJobNames;
      this.koJobAbbrs = koJobAbbrs;
      this.koJobCategories = koJobCategories;
      this.actions = actions;
      this.craftActions = craftActions;
      this.loaded$.next(true);
    });
  }
}
