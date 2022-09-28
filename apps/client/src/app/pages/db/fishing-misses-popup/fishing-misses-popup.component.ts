import { Component, OnInit } from '@angular/core';
import gql from 'graphql-tag';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { Apollo } from 'apollo-angular';
import { debounceTime, first, map, shareReplay, switchMap } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';

@Component({
  selector: 'app-fishing-misses-popup',
  templateUrl: './fishing-misses-popup.component.html',
  styleUrls: ['./fishing-misses-popup.component.less']
})
export class FishingMissesPopupComponent implements OnInit {

  public loading = true;

  public data$: Observable<any>;

  public filterOptions$: Observable<any>;

  public filters$: BehaviorSubject<any> = new BehaviorSubject<any>({});

  public spotId: number;

  public pageIndex = 1;

  public pageSize = 10;

  constructor(private apollo: Apollo, public translate: TranslateService,
              private i18n: I18nToolsService, private lazyData: LazyDataFacade) {
  }

  ngOnInit(): void {
    this.data$ = this.filters$.pipe(
      switchMap(filters => {
        return this.apollo.query<any>({ query: this.getGraphQLQuery(+this.spotId, filters), fetchPolicy: 'no-cache' });
      }),
      map(response => {
        this.loading = false;
        return response.data.fishingresults;
      })
    );

    this.filterOptions$ = combineLatest([
      this.lazyData.getI18nEntry('items'),
      this.lazyData.getI18nEntry('weathers')
    ]).pipe(
      switchMap(([items, weathers]) => {
        return this.data$.pipe(
          map(data => {
            return {
              etime: Object.keys(_.groupBy(data, 'etime'))
                .map(value => {
                  return {
                    text: value.toString(),
                    value: value
                  };
                }),
              baitId: Object.keys(_.groupBy(data, 'baitId'))
                .map(value => {
                  return {
                    text: this.i18n.getName(items[+value]),
                    value: value
                  };
                }),
              biteTime: Object.keys(_.groupBy(data, 'biteTime'))
                .map(value => {
                  return {
                    text: value.toString(),
                    value: value
                  };
                }),
              gathering: Object.keys(_.groupBy(data, 'gathering'))
                .map(value => {
                  return {
                    text: value.toString(),
                    value: value
                  };
                }),
              weatherId: Object.keys(_.groupBy(data, 'weatherId'))
                .map(value => {
                  return {
                    text: this.i18n.getName(weathers[+value]),
                    value: value
                  };
                }),
              previousWeatherId: Object.keys(_.groupBy(data, 'previousWeatherId'))
                .map(value => {
                  return {
                    text: this.i18n.getName(weathers[+value]),
                    value: value
                  };
                }),
              snagging: Object.keys(_.groupBy(data, 'snagging'))
                .map(value => {
                  return {
                    text: this.translate.instant(value === 'true' ? 'Yes' : 'No'),
                    value: value
                  };
                }),
              tug: Object.keys(_.groupBy(data, 'tug'))
                .map(value => {
                  return {
                    text: this.translate.instant(`DB.FISH.TUG.${this.getTugName(+value)}`),
                    value: value
                  };
                })
            };
          })
        );
      }),
      debounceTime(500),
      first(),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }

  filter(key: string, value: any): void {
    this.loading = true;
    if (value.length === 0) {
      const clone = { ...this.filters$.value };
      delete clone[key];
      this.filters$.next(clone);
    } else {
      this.filters$.next({
        ...this.filters$.value,
        [key]: value
      });
    }
  }

  getTugName(tug: number): string {
    return ['Medium', 'Big', 'Light'][tug];
  }

  private getGraphQLQuery(spotId: number, filters: any): any {
    const filtersStr = Object.entries(filters).reduce((acc, [key, value]) => {
      if (value instanceof Array) {
        return `${acc}, ${key}:{_in: ${JSON.stringify(value)}}`;
      } else {
        return `${acc}, ${key}:{_eq: ${value}}`;
      }
    }, `{spot: {_eq: ${spotId}}, itemId: {_eq: -1}`);
    return gql`
          query fishData {
            fishingresults(where: ${filtersStr}}) {
                  etime
                  itemId
                  baitId
                  biteTime
                  chum
                  gathering
                  weatherId
                  mooch
                  previousWeatherId
                  snagging
                  tug
                  hookset
            }
          }
        `;
  }

}
