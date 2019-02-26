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

  public craftActions: any = {};

  public actions: any = {};

  constructor(private http: HttpClient) {
    combineLatest(
      this.http.get('./assets/data/items.json'),
      this.http.get('./assets/data/zh-items.json'),
      this.http.get('./assets/data/ko-items.json'),
      this.http.get('./assets/data/actions.json'),
      this.http.get('./assets/data/craft-actions.json')
    ).subscribe(([items, zhItems, koItems, actions, craftActions]) => {
      this.items = items;
      this.zhItems = zhItems;
      this.koItems = koItems;
      this.actions = actions;
      this.craftActions = craftActions;
      this.loaded$.next(true);
    });
  }
}
