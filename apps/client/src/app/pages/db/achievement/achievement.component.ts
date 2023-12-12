import { Component } from '@angular/core';
import { TeamcraftPageComponent } from '../../../core/component/teamcraft-page-component';
import { Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { XivapiEndpoint } from '@xivapi/angular-client';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { SeoService } from '../../../core/seo/seo.service';
import { filter, map, shareReplay, switchMap } from 'rxjs/operators';
import { SeoMetaConfig } from '../../../core/seo/seo-meta-config';
import { SettingsService } from '../../../modules/settings/settings.service';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { LazyAchievementsDatabasePage } from '@ffxiv-teamcraft/data/model/lazy-achievements-database-page';
import { XivapiIconPipe } from '../../../pipes/pipes/xivapi-icon.pipe';
import { IfMobilePipe } from '../../../pipes/pipes/if-mobile.pipe';
import { I18nRowPipe } from '../../../core/i18n/i18n-row.pipe';
import { I18nPipe } from '../../../core/i18n.pipe';
import { PageLoaderComponent } from '../../../modules/page-loader/page-loader/page-loader.component';
import { ItemRarityDirective } from '../../../core/item-rarity/item-rarity.directive';
import { ItemIconComponent } from '../../../modules/item-icon/item-icon/item-icon.component';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzCardModule } from 'ng-zorro-antd/card';
import { DbCommentsComponent } from '../db-comments/db-comments/db-comments.component';
import { I18nDisplayComponent } from '../../../modules/i18n-display/i18n-display/i18n-display.component';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { DbButtonComponent } from '../../../core/db-button/db-button.component';
import { I18nNameComponent } from '../../../core/i18n/i18n-name/i18n-name.component';
import { FlexModule } from '@angular/flex-layout/flex';
import { NgIf, NgFor, AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-achievement',
    templateUrl: './achievement.component.html',
    styleUrls: ['./achievement.component.less'],
    standalone: true,
    imports: [NgIf, FlexModule, I18nNameComponent, DbButtonComponent, NgFor, NzToolTipModule, I18nDisplayComponent, DbCommentsComponent, NzCardModule, NzListModule, ItemIconComponent, ItemRarityDirective, PageLoaderComponent, AsyncPipe, I18nPipe, TranslateModule, I18nRowPipe, IfMobilePipe, XivapiIconPipe]
})
export class AchievementComponent extends TeamcraftPageComponent {

  public achievement$= this.route.paramMap.pipe(
    filter(params => params.get('slug') !== null),
    map(params => params.get('achievementId')),
    switchMap(id => {
      return this.lazyData.getRow('achievementsDatabasePages', +id);
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  public links$: Observable<{ title: string, icon: string, url: string }[]>;

  public rewards$: Observable<{ type: string, id: number, amount: number }[]>;

  constructor(private route: ActivatedRoute, private i18n: I18nToolsService,
              public translate: TranslateService, private lazyData: LazyDataFacade,
              private router: Router, public settings: SettingsService,
              seo: SeoService) {
    super(seo);
    this.updateSlug(router, i18n, route, 'achievements', 'achievementId');

    this.rewards$ = this.achievement$.pipe(
      map(achievement => {
        const rewards = [];
        if (achievement.item) {
          rewards.push({
            type: 'item',
            id: achievement.item
          });
        }
        if (achievement.title) {
          rewards.push({
            type: 'title',
            id: achievement.title
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
            url: `https://ffxivcollect.com/achievements/${achievement.id}`
          }
        ];
      })
    );
  }

  protected getSeoMeta(): Observable<Partial<SeoMetaConfig>> {
    return this.achievement$.pipe(
      map(achievement => {
        return {
          title: this.getName(achievement),
          description: this.getDescription(achievement),
          url: `https://ffxivteamcraft.com/db/${this.translate.currentLang}/achievement/${achievement.id}/${this.getName(achievement).split(' ').join('-')}`,
          image: `https://xivapi.com${achievement.icon}`
        };
      })
    );
  }

  private getDescription(achievement: LazyAchievementsDatabasePage): string {
    return this.i18n.getName(achievement.description);
  }

  private getName(achievement: LazyAchievementsDatabasePage): string {
    // We might want to add more details for some specific items, which is why this is a method.
    return this.i18n.getName(achievement);
  }
}
