import { Component } from '@angular/core';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { XivapiEndpoint, XivapiService } from '@xivapi/angular-client';
import { LazyDataService } from '../../../core/data/lazy-data.service';
import { TranslateService } from '@ngx-translate/core';
import { map, switchMapTo, tap } from 'rxjs/operators';
import { subMonths } from 'date-fns';

@Component({
  selector: 'app-mappy-dashboard',
  templateUrl: './mappy-dashboard.component.html',
  styleUrls: ['./mappy-dashboard.component.less']
})
export class MappyDashboardComponent {

  public loading = true;

  public reloader$ = new BehaviorSubject<void>(null);

  public display$ = this.reloader$.pipe(switchMapTo(
    combineLatest([
      this.lazyData.data$,
      this.xivapi.getList('mappy/updates' as XivapiEndpoint, { staging: true })
    ]).pipe(
      map(([data, updates]) => {
        const acceptedMaps = Object.values<any>(data.nodes).map(n => n.map);
        return Object.values<any>(data.maps)
          .filter(m => {
            return acceptedMaps.includes(m.id);
          })
          .map(m => {
            return {
              ...m,
              updates: updates[m.id],
              old: {
                BNPC: updates[m.id]?.BNPC < subMonths(new Date(), 3).getTime() / 1000,
                Node: updates[m.id]?.Node < subMonths(new Date(), 3).getTime() / 1000,
              }
            };
          });
      }),
      tap(() => this.loading = false)
    ))
  );

  constructor(private activatedRoute: ActivatedRoute, private xivapi: XivapiService,
              private lazyData: LazyDataService, public translate: TranslateService) {
  }

}
