import { XivDataService } from '../xiv/xiv-data.service';
import { AbstractExtractor } from '../abstract-extractor';
import { makeIcon } from '../xiv/make-icon';

export class QuestsExtractor extends AbstractExtractor {
  protected doExtract(xiv: XivDataService): any {
    const itemNames = this.requireLazyFile('items');
    const quests = {};
    const nextQuest = {};
    const questChainLengths = {};
    const usedInQuests = {};
    this.getSheet<any>(xiv, `Quest`, [
      'Name',
      'Icon',
      'PreviousQuest#',
      'IconSpecial',
      'OtherReward.Name',
      'JournalGenre.Icon#',
      'RewardItem#',
      'ItemReward.RequiredAmount#',
      'ItemReward.RequiredItem#',
      'ItemReward.RewardAmount#',
      'ItemReward.RewardItem#',
      `OptionalItemIsHQReward#`,
      `IsHQReward#`,
      `ItemCountReward#`,
      `OptionalItemCountReward#`,
      `OptionalItemReward.RequiredAmount#`,
      `OptionalItemReward.RequiredItem#`,
      `OptionalItemReward.RewardAmount#`,
      `OptionalItemReward.RewardItem#`,
      `ItemRewardType`
    ], false, 1).subscribe(entries => {
      entries.forEach(quest => {
        quests[quest.index] = {
          name: {
            en: quest.Name_en,
            ja: quest.Name_ja,
            de: quest.Name_de,
            fr: quest.Name_fr
          },
          icon: makeIcon(quest.IconSpecial || this.getHDJournalGenreIcon(quest.JournalGenre.IconID) || 71221),
          rewards: [],
          trades: []
        };

        if (quest.OtherReward?.index > 0) {
          const itemId = Object.keys(itemNames).find(key => itemNames[key].en === quest.OtherReward.Name_en);
          if (itemId) {
            quests[quest.index].rewards = quests[quest.index].rewards || [];
            quests[quest.index].rewards.push({
              id: +itemId,
              amount: 1
            });
          }
        }

        const fromItemRewards = this.parseReward(quest.ItemReward, quest, 'Item', usedInQuests);
        const fromOptionalItemRewards = this.parseReward(quest.OptionalItemReward, quest, 'OptionalItem', usedInQuests);

        quests[quest.index].rewards.push(...fromItemRewards.rewards, ...fromOptionalItemRewards.rewards);
        quests[quest.index].trades.push(...fromItemRewards.trades, ...fromOptionalItemRewards.trades);

        if (quests[quest.index].rewards.length === 0) {
          delete quests[quest.index].rewards;
        }
        if (quests[quest.index].trades.length === 0) {
          delete quests[quest.index].trades;
        }

        quest.PreviousQuest.forEach(q => {
          if (q > 0 && quest.IconID !== 71201) {
            nextQuest[q] = [...(nextQuest[q] || []), quest.index];
          }
        });
      });
      Object.keys(quests)
        .map(key => +key)
        .forEach(questId => {
          let workingIds = [questId];
          let depth = 0;
          while ([].concat.apply([], workingIds.map(id => nextQuest[id] || [])).length > 0 && depth < 99) {
            workingIds = [].concat.apply([], workingIds.map(id => nextQuest[id]));
            depth++;
          }
          questChainLengths[questId] = depth;
        });
      this.persistToJsonAsset('quests', quests);
      this.persistToJsonAsset('used-in-quests', usedInQuests);
      this.persistToTypescript('quests-chain-lengths', 'questChainLengths', questChainLengths);
      this.done();
    });
  }

  private getHDJournalGenreIcon(iconId: number): number {
    return {
      61411: 71221,
      61412: 71201,
      61413: 71222,
      61414: 71281,
      61415: 60552,
      61416: 61436,

      // grand companies
      61401: 62951, // limsa
      61402: 62952, // grid
      61403: 62953 // uldah
    }[iconId] || iconId;
  }

  /**
   * @param _rewards SaintC Item[]
   * @param quest SaintC Quest
   * @param key
   * @param usedInQuests
   * @private
   */
  private parseReward(_rewards: any[], quest: any, key: 'Item' | 'OptionalItem', usedInQuests: Record<number, number[]>): { trades: any[], rewards: any[] } {
    const rewards = [];
    const trades = [];
    _rewards.forEach((reward, i) => {
      if (Array.isArray(reward)) {
        reward.forEach(questReward => {
          if (questReward.index === 0) {
            return;
          }
          // If it's a trade
          if (questReward.RequiredAmount[0] > 0) {
            // console.log(quest);
            trades.push({
              currencies: questReward.RequiredItem.map((id, index) => {
                const amount = questReward.RequiredAmount[index];
                if (id > 0) {
                  usedInQuests[id] = [...usedInQuests[id] || [], quest.index];
                }
                return {
                  id,
                  amount
                };
              }).filter(e => e.amount > 0),
              items: questReward.RewardItem.map((item, index) => {
                return {
                  id: item,
                  amount: questReward.RewardAmount[index]
                };
              }).filter(e => e.amount > 0)
            });
          } else {
            questReward.RewardItem.forEach((item, index) => {
              if (item > 0) {
                rewards.push({
                  id: item,
                  amount: questReward.RewardAmount[index]
                });
              }
            });
          }
          return [questReward];
        });
        return { rewards, trades };
      }
      if (!reward || reward?.index === 0) {
        return;
      }

      switch (reward.__sheet) {
        case 'Item':
          const entry: any = {
            id: reward.index,
            amount: quest[`${key}CountReward`][i]
          };
          if (key === 'OptionalItem' && quest.OptionalItemIsHQReward[i]) {
            entry.hq = true;
          }
          rewards.push(entry);
          break;
        case 'BeastRankBonus':
        default:
          return;
      }
    });
    return {
      rewards,
      trades
    };
  }

  getName(): string {
    return 'quests';
  }

}
