import { Component } from '@angular/core';
import { TeamcraftPageComponent } from '../../../core/component/teamcraft-page-component';
import { Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { TranslateService } from '@ngx-translate/core';
import { SeoService } from '../../../core/seo/seo.service';
import { filter, map, shareReplay, switchMap } from 'rxjs/operators';
import { SeoMetaConfig } from '../../../core/seo/seo-meta-config';
import { SettingsService } from '../../../modules/settings/settings.service';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { LazyFatesDatabasePage } from '@ffxiv-teamcraft/data/model/lazy-fates-database-page';

@Component({
  selector: 'app-fate',
  templateUrl: './fate.component.html',
  styleUrls: ['./fate.component.less']
})
export class FateComponent extends TeamcraftPageComponent {

  public fate$ = this.route.paramMap.pipe(
    filter(params => params.get('slug') !== null),
    map(params => params.get('fateId')),
    switchMap(fateId => this.lazyData.getRow('fatesDatabasePages', +fateId)),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  public links$: Observable<{ title: string, icon: string, url: string }[]>;

  constructor(private route: ActivatedRoute, private i18n: I18nToolsService,
              private lazyData: LazyDataFacade,
              private translate: TranslateService, private router: Router,
              public settings: SettingsService, seo: SeoService) {
    super(seo);
    this.updateSlug(router, i18n, route, 'fates', 'fateId');

    this.links$ = this.fate$.pipe(
      map((fate) => {
        return [
          {
            title: 'GarlandTools',
            url: `https://www.garlandtools.org/db/#fate/${fate.id}`,
            icon: 'https://garlandtools.org/favicon.png'
          },
          {
            title: 'Gamer Escape',
            url: `https://ffxiv.gamerescape.com/wiki/${fate.en.toString().split(' ').join('_').replace('\'', '%27')}`,
            icon: './assets/icons/ge.png'
          }
        ];
      })
    );
  }

  protected getSeoMeta(): Observable<Partial<SeoMetaConfig>> {
    return this.fate$.pipe(
      map(fate => {
        return {
          title: this.getName(fate),
          description: this.getDescription(fate),
          url: `https://ffxivteamcraft.com/db/${this.translate.currentLang}/fate/${fate.id}/${this.getName(fate).split(' ').join('-')}`,
          image: `https://xivapi.com${fate.icon}`
        };
      })
    );
  }

  private getDescription(fate: LazyFatesDatabasePage): string {
    return this.i18n.getName(fate.description);
  }

  private getName(fate: LazyFatesDatabasePage): string {
    return this.i18n.getName(fate);
  }
}
