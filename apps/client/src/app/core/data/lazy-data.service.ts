import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable, ReplaySubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { XivapiService } from '@xivapi/angular-client';
import { isPlatformServer } from '@angular/common';
import { PlatformService } from '../tools/platform.service';
import { environment } from '../../../environments/environment';
import { ListRow } from '../../modules/list/model/list-row';
import { map } from 'rxjs/operators';
import { LazyData } from './lazy-data';
import { lazyFilesList } from './lazy-files-list';

@Injectable({
  providedIn: 'root'
})
export class LazyDataService {

  public dohdolMeldingRates = {
    hq: [
      // Sockets
      //2, 3,  4,  5    // Tier
      [90, 48, 28, 16], // I
      [82, 44, 26, 16], // II
      [70, 38, 22, 14], // III
      [58, 32, 20, 12], // IV
      [17, 10, 7, 5],   // V
      [17, 0, 0, 0],    // VI
      [17, 10, 7, 5],   // VII
      [17, 0, 0, 0]     // VIII
    ],
    nq: [
      // Sockets
      //2, 3,  4,  5    // Tier
      [80, 40, 20, 10], // I
      [72, 36, 18, 10], // II
      [60, 30, 16, 8], // III
      [48, 24, 12, 6], // IV
      [12, 6, 3, 2],   // V
      [12, 0, 0, 0],    // VI
      [12, 6, 3, 2],   // VII
      [12, 0, 0, 0]     // VIII
    ]
  };


  public loaded$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  public datacenters: { [index: string]: string[] } = {};
  public patches: any[] = [];

  public extracts: ListRow[];
  public extracts$: ReplaySubject<ListRow[]> = new ReplaySubject<ListRow[]>();

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

  protected load(): void {
    combineLatest([this.xivapi.getDCList(), this.getData('https://xivapi.com/patchlist'), this.getData('/assets/extracts.json')])
      .subscribe(([dcList, patches, extracts]) => {
        this.datacenters = dcList as { [index: string]: string[] };
        this.patches = patches as any[];
        this.extracts = extracts;
        this.extracts$.next(extracts);
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
