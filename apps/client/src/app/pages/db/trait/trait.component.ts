import { Component } from '@angular/core';
import { TeamcraftPageComponent } from '../../../core/component/teamcraft-page-component';
import { Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { XivapiEndpoint, XivapiService } from '@xivapi/angular-client';
import { DataService } from '../../../core/api/data.service';
import { LocalizedDataService } from '../../../core/data/localized-data.service';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { TranslateService } from '@ngx-translate/core';
import { SeoService } from '../../../core/seo/seo.service';
import { filter, map, shareReplay, switchMap } from 'rxjs/operators';
import { SeoMetaConfig } from '../../../core/seo/seo-meta-config';
import { SettingsService } from '../../../modules/settings/settings.service';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { withLazyData } from '../../../core/rxjs/with-lazy-data';

@Component({
  selector: 'app-trait',
  templateUrl: './trait.component.html',
  styleUrls: ['./trait.component.less']
})
export class TraitComponent extends TeamcraftPageComponent {

  public xivapiTrait$: Observable<any>;

  public links$: Observable<{ title: string, icon: string, url: string }[]>;

  public relatedActions$: Observable<number[]>;

  constructor(private route: ActivatedRoute, private xivapi: XivapiService,
              private gt: DataService, private l12n: LocalizedDataService,
              private i18n: I18nToolsService, private translate: TranslateService,
              private router: Router, private lazyData: LazyDataFacade, public settings: SettingsService,
              seo: SeoService) {
    super(seo);

    this.route.paramMap.subscribe(params => {
      const slug = params.get('slug');
      if (slug === null) {
        this.router.navigate(
          [this.i18n.getName(this.l12n.getTrait(+params.get('traitId'))).split(' ').join('-')],
          {
            relativeTo: this.route,
            replaceUrl: true
          }
        );
      } else if (slug !== this.i18n.getName(this.l12n.getTrait(+params.get('traitId'))).split(' ').join('-')) {
        this.router.navigate(
          ['../', this.i18n.getName(this.l12n.getTrait(+params.get('traitId'))).split(' ').join('-')],
          {
            relativeTo: this.route,
            replaceUrl: true
          }
        );
      }
    });

    const traitId$ = this.route.paramMap.pipe(
      filter(params => params.get('slug') !== null),
      map(params => params.get('traitId'))
    );


    this.xivapiTrait$ = traitId$.pipe(
      switchMap(id => {
        return this.xivapi.get(XivapiEndpoint.Trait, +id);
      }),
      shareReplay(1)
    );

    this.relatedActions$ = this.xivapiTrait$.pipe(
      withLazyData(this.lazyData, 'actions', 'craftActions', 'actionIcons'),
      map(([trait, actions, craftActions, actionIcons]) => {
        const description = trait.Description_en;
        return Object.keys({ ...actions, ...craftActions })
          .filter(key => {
            return description.indexOf(`>${this.l12n.getAction(+key).en}<`) > -1 && actionIcons[+key] !== undefined;
          })
          .map(key => +key);
      })
    );

    this.links$ = this.xivapiTrait$.pipe(
      map((xivapiAction) => {
        return [
          {
            title: 'Gamer Escape',
            url: `https://ffxiv.gamerescape.com/wiki/${xivapiAction.Name_en.toString().split(' ').join('_')}`,
            icon: './assets/icons/ge.png'
          }
        ];
      })
    );
  }

  private getDescription(trait: any): string {
    return this.i18n.getName(this.l12n.xivapiToI18n(trait, 'traitDescriptions', 'Description'));
  }

  private getName(trait: any): string {
    // We might want to add more details for some specific items, which is why this is a method.
    return this.i18n.getName(this.l12n.xivapiToI18n(trait, 'traits'));
  }

  protected getSeoMeta(): Observable<Partial<SeoMetaConfig>> {
    return this.xivapiTrait$.pipe(
      map(trait => {
        return {
          title: this.getName(trait),
          description: this.getDescription(trait),
          url: `https://ffxivteamcraft.com/db/${this.translate.currentLang}/trait/${trait.ID}/${this.getName(trait).split(' ').join('-')}`,
          image: `https://xivapi.com${trait.Icon}`
        };
      })
    );
  }
}
