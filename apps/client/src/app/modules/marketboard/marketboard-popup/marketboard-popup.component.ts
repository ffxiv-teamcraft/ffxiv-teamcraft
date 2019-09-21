import { Component, Input, OnInit } from '@angular/core';
import { AuthFacade } from '../../../+state/auth.facade';
import { catchError, map, shareReplay, switchMap, tap } from 'rxjs/operators';
import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs';
import { LazyDataService } from '../../../core/data/lazy-data.service';
import { MarketboardItem } from '@xivapi/angular-client/src/model/schema/market/marketboard-item';
import { SettingsService } from '../../settings/settings.service';
import { HttpClient } from '@angular/common/http';
import { UniversalisService } from '../../../core/api/universalis.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-marketboard-popup',
  templateUrl: './marketboard-popup.component.html',
  styleUrls: ['./marketboard-popup.component.less']
})
export class MarketboardPopupComponent implements OnInit {

  @Input()
  itemId: number;

  @Input()
  showHistory = false;

  prices$: Observable<any[]>;

  history$: Observable<any[]>;

  loading = true;

  loadingHistory = true;

  server$: Observable<string>;

  error = false;

  sort$: BehaviorSubject<{ key: string, value: 'ascend' | 'descend' }> = new BehaviorSubject<{ key: string, value: any }>({
    key: 'PricePerUnit',
    value: 'ascend'
  });

  constructor(private authFacade: AuthFacade, private http: HttpClient, private lazyData: LazyDataService,
              private settings: SettingsService, private universalis: UniversalisService, private translate: TranslateService) {
  }

  ngOnInit() {
    this.server$ = this.authFacade.mainCharacter$.pipe(
      map(character => character.Server),
      shareReplay(1)
    );

    const data$: Observable<MarketboardItem> = this.server$.pipe(
      map(server => {
        return [Object.keys(this.lazyData.datacenters).find(dc => {
          return this.lazyData.datacenters[dc].indexOf(server) > -1;
        }), server];
      }),
      switchMap(([dc, server]) => {
        return this.universalis.getDCPrices(dc, this.itemId).pipe(
          map(result => {
            const res = result[0];
            if (this.settings.disableCrossWorld) {
              res.Prices = res.Prices.filter((price: any) => {
                return price.Server === server;
              });
              res.History = res.History.filter((price: any) => {
                return price.Server === server;
              });
            }
            return res;
          })
        );
      })
    );

    this.prices$ = combineLatest(data$
        .pipe(
          map(item => item.Prices),
          tap(() => this.loading = false),
          catchError((err) => {
            console.error(err);
            this.error = true;
            return of([]);
          }),
          shareReplay(1)
        ),
      this.sort$
    ).pipe(
      map(([prices, sort]) => {
        return [...prices.sort((a, b) => {
          if (sort.value === 'ascend') {
            if (a[sort.key] === b[sort.key]) {
              return a.PricePerUnit > b.PricePerUnit ? 1 : -1;
            }
            return a[sort.key] > b[sort.key] ? 1 : -1;
          } else {
            if (a[sort.key] === b[sort.key]) {
              return a.PricePerUnit > b.PricePerUnit ? 1 : -1;
            }
            return a[sort.key] < b[sort.key] ? 1 : -1;
          }
        })];
      })
    );

    this.history$ = data$.pipe(
      map(item => item.History),
      catchError((err) => {
        console.error(err);
        this.error = true;
        return of([]);
      }),
      tap(() => this.loadingHistory = false),
      map(history => {
        return history
          .sort((a, b) => b.PurchaseDate - a.PurchaseDate)
          .map(entry => {
            return {
              ...entry,
              PurchaseDate: entry.PurchaseDate + '000'
            };
          });
      }),
      shareReplay(1)
    );
  }

  sort(event: any): void {
    this.sort$.next({ key: event.key, value: event.value });
  }

  getLocale(): string {
    return this.translate.currentLang;
  }

}
