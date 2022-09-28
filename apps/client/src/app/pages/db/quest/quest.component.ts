import { Component } from '@angular/core';
import { combineLatest, Observable, of } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { XivapiEndpoint, XivapiService } from '@xivapi/angular-client';
import { DataService } from '../../../core/api/data.service';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { TranslateService } from '@ngx-translate/core';
import { SeoService } from '../../../core/seo/seo.service';
import { filter, map, shareReplay, startWith, switchMap } from 'rxjs/operators';
import { SeoMetaConfig } from '../../../core/seo/seo-meta-config';
import { QuestData } from '../../../model/garland-tools/quest-data';
import { TeamcraftPageComponent } from '../../../core/component/teamcraft-page-component';
import * as _ from 'lodash';
import { SettingsService } from '../../../modules/settings/settings.service';
import { questChainLengths } from '../../../core/data/sources/quests-chain-lengths';
import { Trade } from '../../../modules/list/model/trade';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { LazyQuest } from '../../../lazy-data/model/lazy-quest';
import { safeCombineLatest } from '../../../core/rxjs/safe-combine-latest';

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

  public trades$: Observable<Trade[]>;

  constructor(private route: ActivatedRoute, private xivapi: XivapiService,
              private gt: DataService,
              private i18n: I18nToolsService, public translate: TranslateService,
              private router: Router, private lazyData: LazyDataFacade, public settings: SettingsService,
              seo: SeoService) {
    super(seo);
    this.updateSlug(router, i18n, route, 'quests', 'questId');

    const questId$ = this.route.paramMap.pipe(
      filter(params => params.get('slug') !== null),
      map(params => params.get('questId'))
    );

    this.gtData$ = questId$.pipe(
      switchMap(id => {
        return this.gt.getQuest(+id);
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    );

    this.xivapiQuest$ = questId$.pipe(
      switchMap(id => {
        return this.xivapi.get(XivapiEndpoint.Quest, +id);
      }),
      map(quest => {
        quest.chainLength = questChainLengths[quest.ID];
        return quest;
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    );

    this.startingPoint$ = this.xivapiQuest$.pipe(
      switchMap(quest => {
        return this.lazyData.getRow('npcs', quest.IssuerStart);
      }),
      filter(npc => npc && !!npc.position),
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
      switchMap(([quest, gtData]) => {
        return this.lazyData.getRow('quests', quest.ID).pipe(
          map(lData => [quest, gtData, lData] as [any, any, LazyQuest])
        );
      }),
      map(([quest, gtData, lData]) => {
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
        rewards.push(...(lData.rewards || []).map(r => {
          return {
            ...r,
            type: 'item'
          };
        }));
        return rewards;
      })
    );

    this.trades$ = this.xivapiQuest$.pipe(
      switchMap(quest => {
        return this.lazyData.getRow('quests', quest.ID).pipe(
          map(res => res.trades)
        );
      })
    );

    this.involvedNpcs$ = actorIds$.pipe(
      switchMap(ids => {
        return safeCombineLatest(ids
          .filter(id => id < 5000000)
          .map(id => {
            return this.lazyData.getRow('npcs', id).pipe(
              map(npc => {
                if (!!npc) {
                  return id;
                }
                return null;
              })
            );
          })).pipe(
          map(filteredIds => filteredIds.filter(id => id !== null))
        );
      })
    );

    this.textData$ = combineLatest([this.xivapiQuest$, lang$]).pipe(
      map(([quest, lang]) => {
        return quest[`TextData_${lang}`] || quest.TextData_en;
      }),
      filter(textData => !!textData),
      map(textData => {
        textData.Dialogue = textData.Dialogue.filter(d => d.Text !== 'deleted');
        return textData;
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    );

    this.links$ = combineLatest([this.xivapiQuest$]).pipe(
      map(([xivapiQuest]) => {
        return [
          {
            title: 'GarlandTools',
            url: `https://www.garlandtools.org/db/#quest/${xivapiQuest.ID}`,
            icon: 'https://garlandtools.org/favicon.png'
          },
          {
            title: 'Gamer Escape',
            url: `https://ffxiv.gamerescape.com/wiki/${encodeURIComponent(xivapiQuest.Name_en.toString().split(' ').join('_'))}`,
            icon: './assets/icons/ge.png'
          }
        ];
      })
    );
  }

  public getName(quest: any): string {
    // We might want to add more details for some specific quests, which is why this is a method.
    return this.i18n.getName(this.i18n.xivapiToI18n(quest)).replace('', '•');
  }

  public getDescription(quest: any): Observable<string> {
    const lang = this.translate.currentLang;
    const textData = quest[`TextData_${lang}`];
    if (!textData) {
      if (lang === 'zh') {
        return this.lazyData.getRow('zhQuestDescriptions', quest.ID).pipe(
          map(zhRow => {
            if (zhRow) {
              return zhRow.zh;
            }
            return '';
          })
        );
      } else if (lang === 'ko') {
        return this.lazyData.getRow('koQuestDescriptions', quest.ID).pipe(
          map(koRow => {
            if (koRow) {
              return koRow.ko;
            }
            return '';
          })
        );
      } else {
        return of('quest.TextData_en');
      }
    }

    if (textData && textData.Journal) {
      return of(textData.Journal[0].Text);
    } else {
      return of('');
    }
  }

  protected getSeoMeta(): Observable<Partial<SeoMetaConfig>> {
    return this.xivapiQuest$.pipe(
      switchMap(quest => {
        return this.getDescription(quest).pipe(
          map(description => [quest, description])
        );
      }),
      map(([quest, description]) => {
        return {
          title: this.getName(quest),
          description,
          url: `https://ffxivteamcraft.com/db/${this.translate.currentLang}/quest/${quest.ID}/${this.getName(quest).split(' ').join('-')}`,
          image: quest.Banner ? `https://xivapi.com/${quest.Banner}` : `https://xivapi.com/${quest.Icon}`
        };
      })
    );
  }

}
