import { Component } from '@angular/core';
import { TeamcraftPageComponent } from '../../../core/component/teamcraft-page-component';
import { Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { TranslateService } from '@ngx-translate/core';
import { SeoService } from '../../../core/seo/seo.service';
import { filter, map, shareReplay, switchMap, takeUntil } from 'rxjs/operators';
import { SeoMetaConfig } from '../../../core/seo/seo-meta-config';
import { actionCombos } from '../../../core/data/sources/action-combos';
import { SettingsService } from '../../../modules/settings/settings.service';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { withLazyRow } from '../../../core/rxjs/with-lazy-row';

@Component({
  selector: 'app-action',
  templateUrl: './action.component.html',
  styleUrls: ['./action.component.less']
})
export class ActionComponent extends TeamcraftPageComponent {

  public action$ = this.route.paramMap.pipe(
    filter(params => params.get('slug') !== null),
    map(params => params.get('actionId')),
    switchMap((id) => {
      return this.lazyData.getRow('actionsDatabasePages', +id).pipe(
        withLazyRow(this.lazyData, 'actionCdGroups', action => action.cdGroup),
        map(([action, cdGroup]) => {
          if (action.cdGroup && action.recast !== 25) {
            (action as any).sharesCooldownWith = cdGroup;
          }
          (action as any).combos = Object.keys(actionCombos)
            .filter(key => actionCombos[key] === action.id)
            .map(key => +key);
          return action;
        })
      );
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

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

  public relatedTraits$ = this.action$.pipe(
    map((action) => {
      return action.traits;
    })
  );

  constructor(private route: ActivatedRoute, private lazyData: LazyDataFacade,
              private i18n: I18nToolsService, private translate: TranslateService,
              private router: Router, public settings: SettingsService,
              seo: SeoService) {
    super(seo);

    route.paramMap.pipe(
      takeUntil(this.onDestroy$),
      switchMap(params => {
        const slug = params.get('slug');
        return i18n.getActionName(+params.get('actionId')).pipe(
          map(name => {
            const correctSlug = name.split(' ').join('-');
            return { slug, correctSlug };
          })
        );
      })
    ).subscribe(({ slug, correctSlug }) => {
      if (slug === null) {
        router.navigate(
          [correctSlug],
          {
            relativeTo: route,
            replaceUrl: true
          }
        );
      } else if (slug !== correctSlug) {
        router.navigate(
          ['../', correctSlug],
          {
            relativeTo: route,
            replaceUrl: true
          }
        );
      }
    });

    this.links$ = this.action$.pipe(
      map((action) => {
        return [
          {
            title: 'GarlandTools',
            url: `https://www.garlandtools.org/db/#action/${action.id}`,
            icon: 'https://garlandtools.org/favicon.png'
          },
          {
            title: 'Gamer Escape',
            url: `https://ffxiv.gamerescape.com/wiki/${action.en.toString().split(' ').join('_')}`,
            icon: './assets/icons/ge.png'
          }
        ];
      })
    );
  }

  protected getSeoMeta(): Observable<Partial<SeoMetaConfig>> {
    return this.action$.pipe(
      map(action => {
        return {
          title: this.getName(action),
          description: this.getDescription(action),
          url: `https://ffxivteamcraft.com/db/${this.translate.currentLang}/action/${action.id}/${this.getName(action).split(' ').join('-')}`,
          image: `https://xivapi.com${action.icon}`
        };
      })
    );
  }

  private getDescription(action: any): string {
    return this.i18n.getName(action.description);
  }

  private getName(action: any): string {
    // We might want to add more details for some specific items, which is why this is a method.
    return this.i18n.getName(action);
  }
}
