import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable, ReplaySubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { XivapiService } from '@xivapi/angular-client';
import { isPlatformServer } from '@angular/common';
import { PlatformService } from '../tools/platform.service';
import { environment } from '../../../environments/environment';
import { ListRow } from '../../modules/list/model/list-row';
import { map, shareReplay, tap } from 'rxjs/operators';
import { LazyData } from './lazy-data';
import { lazyFilesList } from './lazy-files-list';

@Injectable({
  providedIn: 'root'
})
export class LazyDataService {

  public loaded$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  public datacenters: { [index: string]: string[] } = {};
  public patches: any[] = [];

  public extracts: ListRow[];
  public extracts$: Observable<ListRow[]> = this.getData('/assets/extracts.json').pipe(
    tap(extracts => this.extracts = extracts),
    shareReplay(1)
  );

  public data: LazyData;
  public data$: ReplaySubject<LazyData> = new ReplaySubject<LazyData>();

  constructor(private http: HttpClient, private xivapi: XivapiService, @Inject(PLATFORM_ID) private platform: Object,
              private platformService: PlatformService) {
    if (isPlatformServer(platform)) {
      this.loaded$.next(true);
    } else {
      this.load();
    }
  }

  public get allItems(): any {
    const res = { ...this.data.items };
    Object.keys(this.data.koItems).forEach(koKey => {
      if (res[koKey] !== undefined) {
        res[koKey].ko = this.data.koItems[koKey].ko;
      } else {
        res[koKey] = this.data.koItems[koKey];
      }
    });
    Object.keys(this.data.zhItems).forEach(zhKey => {
      if (res[zhKey] !== undefined) {
        res[zhKey].zh = this.data.zhItems[zhKey].zh;
      } else {
        res[zhKey] = this.data.zhItems[zhKey];
      }
    });
    return res;
  }

  public merge(...dataEntries: any[]): any {
    return dataEntries.reduce((merged, entry) => {
      Object.keys(entry)
        .forEach(key => {
          if (merged[key] !== undefined) {
            Object.keys(entry[key])
              .forEach(lang => {
                merged[key][lang] = entry[key][lang];
              });
          } else {
            merged[key] = merged[key] || entry[key];
          }
        });
      return merged;
    }, {});
  }

  private load(): void {
    combineLatest([this.xivapi.getDCList(), this.getData('https://xivapi.com/patchlist')])
      .subscribe(([dcList, patches]) => {
        this.datacenters = dcList as { [index: string]: string[] };
        this.patches = patches as any[];
      });

    combineLatest(lazyFilesList.map(row => {
      return this.getData(`/assets/data/${environment.production ? row.hashedFileName : row.fileName}`).pipe(
        map(data => {
          return {
            ...row,
            data: data
          };
        })
      );
    })).subscribe((results) => {
      const lazyData: Partial<LazyData> = {};
      results.forEach(row => {
        lazyData[row.propertyName] = row.data;
      });
      this.data = lazyData as LazyData;
      this.data$.next(this.data);
      this.loaded$.next(true);
    });
  }

  private getData(path: string): Observable<any> {
    let url: string;
    if (path.startsWith('http')) {
      url = path;
    } else {
      if (this.platformService.isDesktop() || !environment.production || isPlatformServer(this.platform)) {
        url = `.${path}`;
      } else {
        url = `https://cdn.ffxivteamcraft.com${path}`;
      }
    }
    return this.http.get(url);
  }
}
