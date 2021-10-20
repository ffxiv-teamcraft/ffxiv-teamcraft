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

@Component({
  selector: 'app-achievement',
  templateUrl: './achievement.component.html',
  styleUrls: ['./achievement.component.less']
})
export class AchievementComponent extends TeamcraftPageComponent {

  public achievement$: Observable<any>;

  public links$: Observable<{ title: string, icon: string, url: string }[]>;

  public rewards$: Observable<{ type: string, id: number, amount: number }[]>;

  constructor(private route: ActivatedRoute, private xivapi: XivapiService,
              private gt: DataService, private l12n: LocalizedDataService,
              private i18n: I18nToolsService, public translate: TranslateService,
              private router: Router, public settings: SettingsService,
              seo: SeoService) {
    super(seo);

    this.route.paramMap.subscribe(params => {
      const slug = params.get('slug');
      const correctSlug = this.i18n.getName(this.l12n.getAchievementName(+params.get('achievementId'))).split(' ').join('-');

      if (slug === null) {
        this.router.navigate(
          [correctSlug],
          {
            relativeTo: this.route,
            replaceUrl: true
          }
        );
      } else if (slug !== correctSlug) {
        this.router.navigate(
          ['../', correctSlug],
          {
            relativeTo: this.route,
            replaceUrl: true
          }
        );
      }
    });

    const achievementId$ = this.route.paramMap.pipe(
      filter(params => params.get('slug') !== null),
      map(params => params.get('achievementId'))
    );


    this.achievement$ = achievementId$.pipe(
      switchMap(id => {
        return this.xivapi.get(XivapiEndpoint.Achievement, +id);
      }),
      shareReplay(1)
    );

    this.rewards$ = this.achievement$.pipe(
      map(achievement => {
        const rewards = [];
        if (achievement.ItemTargetID) {
          rewards.push({
            type: 'item',
            id: achievement.ItemTargetID
          });
        }
        if (achievement.TitleTargetID) {
          rewards.push({
            type: 'title',
            id: achievement.TitleTargetID
          });
        }

        return rewards;
      })
    );

    this.links$ = this.achievement$.pipe(
      map((achievement) => {
        return [
          {
            title: 'FFXIV Collect',
            icon: 'https://ffxivcollect.com/images/logo_small.png',
            url: `https://ffxivcollect.com/achievements/${achievement.ID}`
          }
        ];
      })
    );
  }

  private getDescription(status: any): string {
    return this.i18n.getName(this.l12n.xivapiToI18n(status, 'achievementDescriptions', 'Description'));
  }

  private getName(status: any): string {
    // We might want to add more details for some specific items, which is why this is a method.
    return this.i18n.getName(this.l12n.xivapiToI18n(status, 'achievements'));
  }

  protected getSeoMeta(): Observable<Partial<SeoMetaConfig>> {
    return this.achievement$.pipe(
      map(achievement => {
        return {
          title: this.getName(achievement),
          description: this.getDescription(achievement),
          url: `https://ffxivteamcraft.com/db/${this.translate.currentLang}/achievement/${achievement.ID}/${this.getName(achievement).split(' ').join('-')}`,
          image: `https://xivapi.com${achievement.Icon}`
        };
      })
    );
  }
}
