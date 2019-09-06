import { Component } from '@angular/core';
import { combineLatest, Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { XivapiEndpoint, XivapiService } from '@xivapi/angular-client';
import { DataService } from '../../../core/api/data.service';
import { LocalizedDataService } from '../../../core/data/localized-data.service';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { TranslateService } from '@ngx-translate/core';
import { LazyDataService } from '../../../core/data/lazy-data.service';
import { SeoService } from '../../../core/seo/seo.service';
import { filter, map, shareReplay, startWith, switchMap } from 'rxjs/operators';
import { SeoMetaConfig } from '../../../core/seo/seo-meta-config';
import { QuestData } from '../../../model/garland-tools/quest-data';
import { TeamcraftPageComponent } from '../../../core/component/teamcraft-page-component';
import * as _ from 'lodash';
import { SettingsService } from '../../../modules/settings/settings.service';
import { questChainLengths } from '../../../core/data/sources/quests-chain-lengths';

@Component({
  selector: 'app-quest',
  templateUrl: './quest.component.html',
  styleUrls: ['./quest.component.less']
})
export class QuestComponent extends TeamcraftPageComponent {

  public gtData$: Observable<QuestData>;

  public xivapiQuest$: Observable<any>;

  public textData$: Observable<any>;

  public links$: Observable<{ title: string, icon: string, url: string }[]>;

  public involvedNpcs$: Observable<number[]>;

  public startingPoint$: Observable<any>;

  public rewards$: Observable<{ type: string, id: number, amount: number }[]>;

  constructor(private route: ActivatedRoute, private xivapi: XivapiService,
              private gt: DataService, private l12n: LocalizedDataService,
              private i18n: I18nToolsService, private translate: TranslateService,
              private router: Router, private lazyData: LazyDataService, public settings: SettingsService,
              seo: SeoService) {
    super(seo);

    this.route.paramMap.subscribe(params => {
      const slug = params.get('slug');
      if (slug === null) {
        this.router.navigate(
          [this.i18n.getName(this.l12n.getQuest(+params.get('questId')).name).split(' ').join('-')],
          {
            relativeTo: this.route,
            replaceUrl: true
          }
        );
      } else if (slug !== this.i18n.getName(this.l12n.getQuest(+params.get('questId')).name).split(' ').join('-')) {
        this.router.navigate(
          ['../', this.i18n.getName(this.l12n.getQuest(+params.get('questId')).name).split(' ').join('-')],
          {
            relativeTo: this.route,
            replaceUrl: true
          }
        );
      }
    });

    const questId$ = this.route.paramMap.pipe(
      filter(params => params.get('slug') !== null),
      map(params => params.get('questId'))
    );

    this.gtData$ = questId$.pipe(
      switchMap(id => {
        return this.gt.getQuest(+id);
      }),
      shareReplay(1)
    );

    this.xivapiQuest$ = questId$.pipe(
      switchMap(id => {
        return this.xivapi.get(XivapiEndpoint.Quest, +id);
      }),
      map(quest => {
        quest.chainLength = questChainLengths[quest.ID];
        return quest;
      }),
      shareReplay(1)
    );

    this.startingPoint$ = this.xivapiQuest$.pipe(
      map(quest => {
        return this.l12n.getNpc(quest.IssuerStart) as any;
      }),
      filter(npc => npc && npc.position),
      map(npc => npc.position)
    );

    const lang$ = this.translate.onLangChange.pipe(
      map(change => change.lang),
      startWith(this.translate.currentLang)
    );

    const actorIds$ = this.xivapiQuest$.pipe(
      map(quest => {
        return _.uniq([
          ...Object.keys(quest)
            .filter(key => /^ActorSpawn(\d+)$/.test(key))
            .map(key => quest[key])
            .filter(id => id !== 0),
          quest.IssuerStart
        ]);
      })
    );

    this.rewards$ = combineLatest([this.xivapiQuest$, this.gtData$]).pipe(
      map(([quest, gtData]) => {
        const rewards = [];
        if (quest.InstanceContentUnlockTargetID) {
          rewards.push({
            id: quest.InstanceContentUnlockTargetID,
            type: 'instance'
          });
        }
        if (quest.GilReward) {
          rewards.push({
            id: 1,
            amount: quest.GilReward,
            type: 'item'
          });
        }
        if (quest.ExperiencePoints) {
          rewards.push({
            amount: quest.ExperiencePoints,
            type: 'exp'
          });
        }
        if (quest.ActionRewardTargetID) {
          rewards.push({
            id: quest.ActionRewardTargetID,
            type: 'action'
          });
        }
        if (quest.GCSeals) {
          rewards.push({
            id: [20, 21, 22][quest.GrandCompanyTargetID - 1],
            amount: quest.GCSeals,
            type: 'item'
          });
        }
        if (gtData.quest.reward && gtData.quest.reward.reputation) {
          rewards.push({
            amount: gtData.quest.reward.reputation,
            type: 'rep'
          });
        }
        for (let i = 0; i <= 14; i++) {
          const index = i < 10 ? `0${i}` : i;
          if (quest[`ItemReward${index}`] > 0) {
            rewards.push({
              id: quest[`ItemReward${index}`],
              amount: quest[`ItemCountReward${index}`],
              type: 'item',
              hq: quest[`IsHQReward${index}`] === 1
            });
          }
        }
        return rewards;
      })
    );

    this.involvedNpcs$ = actorIds$.pipe(
      map(ids => ids
        .filter(id => id < 5000000)
        .filter(id => this.l12n.getNpc(id) !== undefined))
    );

    this.textData$ = combineLatest([this.xivapiQuest$, lang$]).pipe(
      map(([quest, lang]) => {
        return quest[`TextData_${lang}`] || quest.TextData_en;
      }),
      map(textData => {
        textData.Dialogue = textData.Dialogue.filter(d => d.Text !== 'deleted');
        return textData;
      }),
      shareReplay(1)
    );

    this.links$ = combineLatest([this.xivapiQuest$, this.gtData$]).pipe(
      map(([xivapiQuest, gtData]) => {
        return [
          {
            title: 'GarlandTools',
            url: `http://www.garlandtools.org/db/#instance/${xivapiQuest.ID}`,
            icon: 'https://garlandtools.org/favicon.png'
          },
          {
            title: 'Gamer Escape',
            url: `https://ffxiv.gamerescape.com/wiki/${xivapiQuest.Name_en.toString().split(' ').join('_')}`,
            icon: './assets/icons/ge.png'
          }
        ];
      })
    );
  }

  private getName(quest: any): string {
    // We might want to add more details for some specific quests, which is why this is a method.
    return (quest[`Name_${this.translate.currentLang}`] || quest.Name_en).replace('', '•');
  }

  protected getSeoMeta(): Observable<Partial<SeoMetaConfig>> {
    return combineLatest([this.xivapiQuest$, this.textData$]).pipe(
      map(([quest, textData]) => {
        return {
          title: this.getName(quest),
          description: textData.Journal && textData.Journal[0].Text,
          url: `https://ffxivteamcraft.com/db/${this.translate.currentLang}/quest/${quest.ID}/${this.getName(quest).split(' ').join('-')}`,
          image: quest.Banner ? `https://xivapi.com/${quest.Banner}` : `https://xivapi.com/${quest.Icon}`
        };
      })
    );
  }

}
