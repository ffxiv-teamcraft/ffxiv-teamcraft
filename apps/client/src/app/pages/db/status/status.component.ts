import { Component } from '@angular/core';
import { TeamcraftPageComponent } from '../../../core/component/teamcraft-page-component';
import { Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { XivapiEndpoint, XivapiService } from '@xivapi/angular-client';
import { DataService } from '../../../core/api/data.service';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { TranslateService } from '@ngx-translate/core';
import { SeoService } from '../../../core/seo/seo.service';
import { filter, map, shareReplay, switchMap } from 'rxjs/operators';
import { SeoMetaConfig } from '../../../core/seo/seo-meta-config';
import { SettingsService } from '../../../modules/settings/settings.service';

@Component({
  selector: 'app-status',
  templateUrl: './status.component.html',
  styleUrls: ['./status.component.less']
})
export class StatusComponent extends TeamcraftPageComponent {

  public xivapiStatus$: Observable<any>;

  public links$: Observable<{ title: string, icon: string, url: string }[]>;

  constructor(private route: ActivatedRoute, private xivapi: XivapiService,
              private gt: DataService, private i18n: I18nToolsService,
              private translate: TranslateService, private router: Router,
              public settings: SettingsService, seo: SeoService) {
    super(seo);
    this.updateSlug(router, i18n, route, 'statuses', 'statusId');

    const statusId$ = this.route.paramMap.pipe(
      filter(params => params.get('slug') !== null),
      map(params => params.get('statusId'))
    );


    this.xivapiStatus$ = statusId$.pipe(
      switchMap(id => {
        return this.xivapi.get(XivapiEndpoint.Status, +id);
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    );

    this.links$ = this.xivapiStatus$.pipe(
      map(() => {
        return [];
      })
    );
  }

  protected getSeoMeta(): Observable<Partial<SeoMetaConfig>> {
    return this.xivapiStatus$.pipe(
      map(status => {
        return {
          title: this.getName(status),
          description: this.getDescription(status),
          url: `https://ffxivteamcraft.com/db/${this.translate.currentLang}/status/${status.ID}/${this.getName(status).split(' ').join('-')}`,
          image: `https://xivapi.com${status.Icon}`
        };
      })
    );
  }

  private getDescription(status: any): string {
    return this.i18n.getName(this.i18n.xivapiToI18n(status, 'Description'));
  }

  private getName(status: any): string {
    // We might want to add more details for some specific items, which is why this is a method.
    return this.i18n.getName(this.i18n.xivapiToI18n(status, 'statuses'));
  }
}
