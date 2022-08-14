import { Component } from '@angular/core';
import { SeoService } from '../../../core/seo/seo.service';
import { ActivatedRoute, Router } from '@angular/router';
import { XivapiEndpoint, XivapiService } from '@xivapi/angular-client';
import { DataService } from '../../../core/api/data.service';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { TranslateService } from '@ngx-translate/core';
import { TeamcraftPageComponent } from '../../../core/component/teamcraft-page-component';
import { combineLatest, Observable, of } from 'rxjs';
import { SeoMetaConfig } from '../../../core/seo/seo-meta-config';
import { catchError, filter, map, shareReplay, switchMap } from 'rxjs/operators';
import { InstanceData } from '../../../model/garland-tools/instance-data';
import { GtInstance } from '../../../model/garland-tools/gt-instance';
import { SettingsService } from '../../../modules/settings/settings.service';

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
              private gt: DataService,
              private i18n: I18nToolsService, private translate: TranslateService,
              private router: Router, public settings: SettingsService,
              seo: SeoService) {
    super(seo);
    this.updateSlug(router, i18n, route, 'instances', 'instanceId');

    const instanceId$ = this.route.paramMap.pipe(
      filter(params => params.get('slug') !== null),
      map(params => params.get('instanceId'))
    );

    this.gtData$ = instanceId$.pipe(
      switchMap(id => {
        return this.gt.getInstance(+id);
      }),
      catchError(() => {
        const emptyResponse = new InstanceData();
        emptyResponse.instance = new GtInstance();
        return of(emptyResponse);
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    );

    this.xivapiInstance$ = instanceId$.pipe(
      switchMap(id => {
        return this.xivapi.get(XivapiEndpoint.InstanceContent, +id);
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    );

    this.links$ = combineLatest([this.xivapiInstance$, this.gtData$]).pipe(
      map(([xivapiInstance, gtData]) => {
        return [
          {
            title: 'GarlandTools',
            url: `https://www.garlandtools.org/db/#instance/${xivapiInstance.ID}`,
            icon: 'https://garlandtools.org/favicon.png'
          },
          {
            title: 'Gamer Escape',
            url: `https://ffxiv.gamerescape.com/wiki/${encodeURIComponent(xivapiInstance.Name_en.toString().split(' ').join('_'))}`,
            icon: './assets/icons/ge.png'
          }
        ];
      })
    );
  }

  protected getSeoMeta(): Observable<Partial<SeoMetaConfig>> {
    return this.xivapiInstance$.pipe(
      map(instance => {
        return {
          title: this.getName(instance),
          description: this.getDescription(instance),
          url: `https://ffxivteamcraft.com/db/${this.translate.currentLang}/instance/${instance.ID}/${this.getName(instance).split(' ').join('-')}`,
          image: `https://xivapi.com/${instance.Banner}`
        };
      })
    );
  }

  private getDescription(instance: any): string {
    return this.i18n.getName(this.i18n.xivapiToI18n(instance, 'Description'));
  }

  private getName(item: any): string {
    // We might want to add more details for some specific items, which is why this is a method.
    return this.i18n.getName(this.i18n.xivapiToI18n(item));
  }

}
