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

  public koItems: any ={};
  public koActions: any ={};
  public koFCActions: any ={};
  public koWeathers: any ={};
  public koPlaces: any ={};
  public koNpc: any ={};
  public koMobs: any ={};
  public koJobName: any ={};
  public koJobAbbr: any ={};

  public craftActions: any = {};

  public actions: any = {};

  constructor(private http: HttpClient) {
    combineLatest(
      this.http.get('./assets/data/items.json'),
      this.http.get('./assets/data/zh-items.json'),
      this.http.get('./assets/data/ko-items.json'),
      this.http.get('./assets/data/ko-actions.json'),
      this.http.get('./app/core/data/sources/ko-free-company-actions.json'),
      this.http.get('./app/core/data/sources/ko-weathers.json'),
      this.http.get('./app/core/data/sources/ko-places.json'),
      this.http.get('./app/core/data/sources/ko-npc.json'),
      this.http.get('./app/core/data/sources/ko-mobs.json'),
      this.http.get('./app/core/data/sources/ko-job-name.json'),
      this.http.get('./app/core/data/sources/ko-job-abbr.json'),
      this.http.get('./assets/data/actions.json'),
      this.http.get('./assets/data/craft-actions.json')
    ).subscribe(([items, zhItems, koItems, koActions, koFCActions, koWeathers, koPlaces, koNpc, koMobs, koJobName, koJobAbbr, actions, craftActions]) => {
      this.items = items;
      this.zhItems = zhItems;
      this.koItems = koItems;
      this.koActions = koActions;
      this.koFCActions = koFCActions;
      this.koWeathers = koWeathers;
      this.koPlaces = koPlaces;
      this.koNpc = koNpc;
      this.koMobs = koMobs;
      this.koJobName = koJobName;
      this.koJobAbbr = koJobAbbr;
      this.actions = actions;
      this.craftActions = craftActions;
      this.loaded$.next(true);
    });
  }
}
