import { Component } from '@angular/core';
import { combineLatest, Observable } from 'rxjs';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { SeoService } from '../../../core/seo/seo.service';
import { filter, map, shareReplay, switchMap } from 'rxjs/operators';
import { SeoMetaConfig } from '../../../core/seo/seo-meta-config';
import { TeamcraftPageComponent } from '../../../core/component/teamcraft-page-component';
import { SettingsService } from '../../../modules/settings/settings.service';
import { Trade } from '../../../modules/list/model/trade';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { LazyQuestsDatabasePage } from '@ffxiv-teamcraft/data/model/lazy-quests-database-page';
import { I18nName } from '@ffxiv-teamcraft/types';
import { LazyRowPipe } from '../../../pipes/pipes/lazy-row.pipe';
import { LazyIconPipe } from '../../../pipes/pipes/lazy-icon.pipe';
import { XivapiIconPipe } from '../../../pipes/pipes/xivapi-icon.pipe';
import { IfMobilePipe } from '../../../pipes/pipes/if-mobile.pipe';
import { ActionNamePipe } from '../../../pipes/pipes/action-name.pipe';
import { ActionIconPipe } from '../../../pipes/pipes/action-icon.pipe';
import { ItemNamePipe } from '../../../pipes/pipes/item-name.pipe';
import { I18nRowPipe } from '../../../core/i18n/i18n-row.pipe';
import { I18nPipe } from '../../../core/i18n.pipe';
import { PageLoaderComponent } from '../../../modules/page-loader/page-loader/page-loader.component';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { ItemRarityDirective } from '../../../core/item-rarity/item-rarity.directive';
import { XivapiActionTooltipDirective } from '../../../modules/tooltip/xivapi-action-tooltip/xivapi-action-tooltip.directive';
import { ItemIconComponent } from '../../../modules/item-icon/item-icon/item-icon.component';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { DbCommentsComponent } from '../db-comments/db-comments/db-comments.component';
import { MapPositionComponent } from '../../../modules/map/map-position/map-position.component';
import { I18nDisplayComponent } from '../../../modules/i18n-display/i18n-display/i18n-display.component';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { DbButtonComponent } from '../../../core/db-button/db-button.component';
import { I18nNameComponent } from '../../../core/i18n/i18n-name/i18n-name.component';
import { FlexModule } from '@angular/flex-layout/flex';
import { NgIf, NgFor, AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-quest',
    templateUrl: './quest.component.html',
    styleUrls: ['./quest.component.less'],
    standalone: true,
    imports: [NgIf, FlexModule, I18nNameComponent, DbButtonComponent, NgFor, NzToolTipModule, I18nDisplayComponent, MapPositionComponent, DbCommentsComponent, NzDividerModule, NzCardModule, NzListModule, RouterLink, NzTagModule, ItemIconComponent, XivapiActionTooltipDirective, ItemRarityDirective, NzButtonModule, NzIconModule, PageLoaderComponent, AsyncPipe, I18nPipe, TranslateModule, I18nRowPipe, ItemNamePipe, ActionIconPipe, ActionNamePipe, IfMobilePipe, XivapiIconPipe, LazyIconPipe, LazyRowPipe]
})
export class QuestComponent extends TeamcraftPageComponent {

  public quest$ = this.route.paramMap.pipe(
    filter(params => params.get('slug') !== null),
    map(params => params.get('questId')),
    switchMap(id => {
      return combineLatest([
        this.lazyData.getRow('questsDatabasePages', +id),
        this.lazyData.getRow('questsText', +id)
      ]).pipe(
        map(([quest, text]) => {
          (quest as any).text = text;
          return quest;
        })
      );
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  public links$: Observable<{ title: string, icon: string, url: string }[]>;

  public involvedNpcs$: Observable<number[]> = this.quest$.pipe(
    map(quest => {
      return quest.npcs;
    })
  );

  public startingPoint$: Observable<any>;

  public rewards$: Observable<{ type: string, id?: number, amount?: number }[]> = this.quest$.pipe(
    map(quest => quest.rewards)
  );

  public trades$: Observable<Trade[]> = this.quest$.pipe(
    map(quest => {
      return quest.trades;
    })
  );

  constructor(private route: ActivatedRoute,
              private i18n: I18nToolsService, public translate: TranslateService,
              private router: Router, private lazyData: LazyDataFacade, public settings: SettingsService,
              seo: SeoService) {
    super(seo);
    this.updateSlug(router, i18n, route, 'quests', 'questId');

    this.startingPoint$ = this.quest$.pipe(
      map(quest => quest.startingPoint),
      filter(Boolean)
    );

    this.links$ = this.quest$.pipe(
      map((quest) => {
        return [
          {
            title: 'GarlandTools',
            url: `https://www.garlandtools.org/db/#quest/${quest.id}`,
            icon: 'https://garlandtools.org/favicon.png'
          },
          {
            title: 'Gamer Escape',
            url: `https://ffxiv.gamerescape.com/wiki/${encodeURIComponent(quest.en.toString().split(' ').join('_'))}`,
            icon: './assets/icons/ge.png'
          }
        ];
      })
    );
  }

  public getName(quest: LazyQuestsDatabasePage): string {
    // We might want to add more details for some specific quests, which is why this is a method.
    return this.i18n.getName(quest).replace('', '•');
  }

  protected getSeoMeta(): Observable<Partial<SeoMetaConfig>> {
    return this.quest$.pipe(
      map((quest) => {
        return {
          title: this.getName(quest),
          description: this.i18n.getName(quest.description as I18nName),
          url: `https://ffxivteamcraft.com/db/${this.translate.currentLang}/quest/${quest.id}/${this.getName(quest).split(' ').join('-')}`,
          image: quest.banner ? `https://xivapi.com/${quest.banner}` : `https://xivapi.com/${quest.icon}`
        };
      })
    );
  }

}
