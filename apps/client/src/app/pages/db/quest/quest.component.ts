import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { XivapiService } from '@xivapi/angular-client';
import { DataService } from '../../../core/api/data.service';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { TranslateService } from '@ngx-translate/core';
import { SeoService } from '../../../core/seo/seo.service';
import { filter, map, shareReplay, switchMap } from 'rxjs/operators';
import { SeoMetaConfig } from '../../../core/seo/seo-meta-config';
import { TeamcraftPageComponent } from '../../../core/component/teamcraft-page-component';
import { SettingsService } from '../../../modules/settings/settings.service';
import { Trade } from '../../../modules/list/model/trade';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { LazyQuestsDatabasePage } from '@ffxiv-teamcraft/data/model/lazy-quests-database-page';
import { I18nName } from '@ffxiv-teamcraft/types';

@Component({
  selector: 'app-quest',
  templateUrl: './quest.component.html',
  styleUrls: ['./quest.component.less']
})
export class QuestComponent extends TeamcraftPageComponent {

  public quest$ = this.route.paramMap.pipe(
    filter(params => params.get('slug') !== null),
    map(params => params.get('questId')),
    switchMap(id => this.lazyData.getRow('questsDatabasePages', +id)),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  public textData$: Observable<any>;

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

  constructor(private route: ActivatedRoute, private xivapi: XivapiService,
              private gt: DataService,
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
