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
import { actionCombos } from '../../../core/data/sources/action-combos';
import { SettingsService } from '../../../modules/settings/settings.service';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { withLazyData } from '../../../core/rxjs/with-lazy-data';

@Component({
  selector: 'app-action',
  templateUrl: './action.component.html',
  styleUrls: ['./action.component.less']
})
export class ActionComponent extends TeamcraftPageComponent {

  public xviapiAction$: Observable<any>;

  public links$: Observable<{ title: string, icon: string, url: string }[]>;

  public costType = {
    1: 'HP',
    3: 'MP',
    5: 'TP',
    7: 'GP',
    8: 'CP',
    22: 'Beast_gauge',
    25: 'Blood_gauge',
    27: 'Ninki',
    28: 'Chakra',
    29: 'Greasing_lightning',
    30: 'Aetherflow',
    41: 'Oath_gauge',
    45: 'Kenki'
  };

  public relatedTraits$: Observable<number[]>;

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
          [this.i18n.getName(this.l12n.getAction(+params.get('actionId'))).split(' ').join('-')],
          {
            relativeTo: this.route,
            replaceUrl: true
          }
        );
      } else if (slug !== this.i18n.getName(this.l12n.getAction(+params.get('actionId'))).split(' ').join('-')) {
        this.router.navigate(
          ['../', this.i18n.getName(this.l12n.getAction(+params.get('actionId'))).split(' ').join('-')],
          {
            relativeTo: this.route,
            replaceUrl: true
          }
        );
      }
    });

    const actionId$ = this.route.paramMap.pipe(
      filter(params => params.get('slug') !== null),
      map(params => params.get('actionId'))
    );


    this.xviapiAction$ = actionId$.pipe(
      withLazyData(this.lazyData, 'actionCdGroups'),
      switchMap(([id, actionCdGroups]) => {
        if (+id > 100000) {
          return this.xivapi.get(XivapiEndpoint.CraftAction, +id);
        } else {
          return this.xivapi.get(XivapiEndpoint.Action, +id).pipe(
            map(action => {
              if (action.CooldownGroup > 0 && action.Recast100ms !== 25) {
                action.SharesCooldownWith = actionCdGroups[action.CooldownGroup]
                  .filter(i => i !== action.ID);
              }
              action.Combos = Object.keys(actionCombos)
                .filter(key => actionCombos[key] === action.ID)
                .map(key => +key);
              return action;
            })
          );
        }
      }),
      shareReplay(1)
    );

    this.relatedTraits$ = this.xviapiAction$.pipe(
      withLazyData(this.lazyData, 'traits'),
      map(([action, traits]) => {
        return Object.keys(traits)
          .filter(key => {
            return traits[key].description.en.indexOf(`>${action.Name_en}<`) > -1;
          })
          .map(key => +key);
      })
    );

    this.links$ = this.xviapiAction$.pipe(
      map((xivapiAction) => {
        return [
          {
            title: 'GarlandTools',
            url: `http://www.garlandtools.org/db/#action/${xivapiAction.ID}`,
            icon: 'https://garlandtools.org/favicon.png'
          },
          {
            title: 'Gamer Escape',
            url: `https://ffxiv.gamerescape.com/wiki/${xivapiAction.Name_en.toString().split(' ').join('_')}`,
            icon: './assets/icons/ge.png'
          }
        ];
      })
    );
  }

  private getDescription(action: any): string {
    return this.i18n.getName(this.l12n.xivapiToI18n(action, 'actionDescriptions', 'Description'));
  }

  private getName(action: any): string {
    // We might want to add more details for some specific items, which is why this is a method.
    return this.i18n.getName(this.l12n.xivapiToI18n(action, 'actions'));
  }

  protected getSeoMeta(): Observable<Partial<SeoMetaConfig>> {
    return this.xviapiAction$.pipe(
      map(action => {
        return {
          title: this.getName(action),
          description: this.getDescription(action),
          url: `https://ffxivteamcraft.com/db/${this.translate.currentLang}/action/${action.ID}/${this.getName(action).split(' ').join('-')}`,
          image: `https://xivapi.com${action.Icon}`
        };
      })
    );
  }
}
