import { Component } from '@angular/core';
import { TeamcraftPageComponent } from '../../../core/component/teamcraft-page-component';
import { combineLatest, Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { XivapiEndpoint, XivapiService } from '@xivapi/angular-client';
import { DataService } from '../../../core/api/data.service';
import { LocalizedDataService } from '../../../core/data/localized-data.service';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { TranslateService } from '@ngx-translate/core';
import { SeoService } from '../../../core/seo/seo.service';
import { filter, map, shareReplay, switchMap } from 'rxjs/operators';
import { SeoMetaConfig } from '../../../core/seo/seo-meta-config';
import { FateData } from '../../../model/garland-tools/fate-data';
import { mapIds } from '../../../core/data/sources/map-ids';
import { SettingsService } from '../../../modules/settings/settings.service';

@Component({
  selector: 'app-fate',
  templateUrl: './fate.component.html',
  styleUrls: ['./fate.component.less']
})
export class FateComponent extends TeamcraftPageComponent {

  public gtData$: Observable<FateData>;

  public xivapiFate$: Observable<any>;

  public links$: Observable<{ title: string, icon: string, url: string }[]>;

  constructor(private route: ActivatedRoute, private xivapi: XivapiService,
              private gt: DataService, private l12n: LocalizedDataService,
              private i18n: I18nToolsService, private translate: TranslateService,
              private router: Router, public settings: SettingsService,
              seo: SeoService) {
    super(seo);

    this.route.paramMap.subscribe(params => {
      const slug = params.get('slug');
      if (slug === null) {
        this.router.navigate(
          [this.i18n.getName(this.l12n.getFate(+params.get('fateId')).name).split(' ').join('-')],
          {
            relativeTo: this.route,
            replaceUrl: true
          }
        );
      } else if (slug !== this.i18n.getName(this.l12n.getFate(+params.get('fateId')).name).split(' ').join('-')) {
        this.router.navigate(
          ['../', this.i18n.getName(this.l12n.getFate(+params.get('fateId')).name).split(' ').join('-')],
          {
            relativeTo: this.route,
            replaceUrl: true
          }
        );
      }
    });

    const fateId$ = this.route.paramMap.pipe(
      filter(params => params.get('slug') !== null),
      map(params => params.get('fateId'))
    );

    this.gtData$ = fateId$.pipe(
      switchMap(id => {
        return this.gt.getFate(+id);
      }),
      map(data => {
        if (data.fate.zoneid) {
          const mapIdEntry = mapIds.find(entry => entry.zone === data.fate.zoneid);
          if (mapIdEntry !== undefined) {
            data.fate.mapid = mapIdEntry.id;
          }
        }
        return data;
      }),
      shareReplay(1)
    );

    this.xivapiFate$ = fateId$.pipe(
      switchMap(id => {
        return this.xivapi.get(XivapiEndpoint.Fate, +id);
      }),
      shareReplay(1)
    );

    this.links$ = combineLatest([this.xivapiFate$, this.gtData$]).pipe(
      map(([xivapiNpc, gtData]) => {
        return [
          {
            title: 'GarlandTools',
            url: `http://www.garlandtools.org/db/#npc/${xivapiNpc.ID}`,
            icon: 'https://garlandtools.org/favicon.png'
          },
          {
            title: 'Gamer Escape',
            url: `https://ffxiv.gamerescape.com/wiki/${xivapiNpc.Name_en.toString().split(' ').join('_')}`,
            icon: './assets/icons/ge.png'
          }
        ];
      })
    );
  }

  private getDescription(item: any): string {
    const fate = this.l12n.getFate(+item.ID);
    if (!fate) {
      return item.Description_en;
    }

    return this.i18n.getName(fate.description);
  }

  private getName(item: any): string {
    // We might want to add more details for some specific items, which is why this is a method.
    const fate = this.l12n.getFate(+item.ID);
    if (!fate) {
      return item.Name_en;
    }

    return this.i18n.getName(fate.name);
  }

  protected getSeoMeta(): Observable<Partial<SeoMetaConfig>> {
    return this.xivapiFate$.pipe(
      map(fate => {
        return {
          title: this.getName(fate),
          description: this.getDescription(fate),
          url: `https://ffxivteamcraft.com/db/${this.translate.currentLang}/fate/${fate.ID}/${this.getName(fate).split(' ').join('-')}`,
          image: `https://xivapi.com${fate.IconMap}`
        };
      })
    );
  }
}
