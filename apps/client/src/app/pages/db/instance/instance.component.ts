import { Component } from '@angular/core';
import { SeoService } from '../../../core/seo/seo.service';
import { ActivatedRoute, Router } from '@angular/router';
import { XivapiEndpoint, XivapiService } from '@xivapi/angular-client';
import { DataService } from '../../../core/api/data.service';
import { LocalizedDataService } from '../../../core/data/localized-data.service';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { TranslateService } from '@ngx-translate/core';
import { LazyDataService } from '../../../core/data/lazy-data.service';
import { TeamcraftPageComponent } from '../../../core/component/teamcraft-page-component';
import { Observable, of } from 'rxjs';
import { SeoMetaConfig } from '../../../core/seo/seo-meta-config';
import { filter, map, shareReplay } from 'rxjs/operators';
import { switchMap } from 'rxjs/internal/operators/switchMap';
import { InstanceData } from '../../../model/garland-tools/instance-data';

@Component({
  selector: 'app-instance',
  templateUrl: './instance.component.html',
  styleUrls: ['./instance.component.less']
})
export class InstanceComponent extends TeamcraftPageComponent {

  public gtData$: Observable<InstanceData>;

  public xivapiInstance$: Observable<any>;

  public links$: Observable<{ title: string, icon: string, url: string }[]>;

  constructor(private route: ActivatedRoute, private xivapi: XivapiService,
              private gt: DataService, private l12n: LocalizedDataService,
              private i18n: I18nToolsService, private translate: TranslateService,
              private router: Router, private lazyData: LazyDataService,
              seo: SeoService) {
    super(seo);

    this.route.paramMap.subscribe(params => {
      const slug = params.get('slug');
      if (slug === null) {
        this.router.navigate(
          [this.i18n.getName(this.l12n.getInstanceName(+params.get('instanceId'))).split(' ').join('-')],
          {
            relativeTo: this.route,
            replaceUrl: true
          }
        );
      } else if (slug !== this.i18n.getName(this.l12n.getInstanceName(+params.get('instanceId'))).split(' ').join('-')) {
        this.router.navigate(
          ['../', this.i18n.getName(this.l12n.getInstanceName(+params.get('instanceId'))).split(' ').join('-')],
          {
            relativeTo: this.route,
            replaceUrl: true
          }
        );
      }
    });

    const instanceId$ = this.route.paramMap.pipe(
      filter(params => params.get('slug') !== null),
      map(params => params.get('instanceId'))
    );

    this.gtData$ = instanceId$.pipe(
      switchMap(id => {
        return this.gt.getInstance(+id);
      }),
      shareReplay(1)
    );

    this.xivapiInstance$ = instanceId$.pipe(
      switchMap(id => {
        return this.xivapi.get(XivapiEndpoint.InstanceContent, +id);
      }),
      shareReplay(1)
    );

    this.links$ = of([]);
  }

  protected getSeoMeta(): Observable<Partial<SeoMetaConfig>> {
    return of({});
  }

}
