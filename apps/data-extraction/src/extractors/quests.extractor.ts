import { AbstractExtractor } from '../abstract-extractor';

const columns = [
  'ID',
  'Name_*',
  'Icon',
  'PreviousQuest0TargetID',
  'PreviousQuest1TargetID',
  'PreviousQuest2TargetID',
  'IconID',
  'OtherReward',
  `ItemReward*`,
  `IsHQReward*`,
  `ItemCountReward*`,
  `OptionalItemReward*`
];

export class QuestsExtractor extends AbstractExtractor {
  protected doExtract(): any {
    const itemNames = this.requireLazyFile('items');
    const quests = {};
    const nextQuest = {};
    const questChainLengths = {};
    const usedInQuests = {};
    this.getAllPages(`https://xivapi.com/Quest?columns=${columns.join(',')}`).subscribe(page => {
      page.Results.forEach(quest => {
        quests[quest.ID] = {
          name: {
            en: quest.Name_en,
            ja: quest.Name_ja,
            de: quest.Name_de,
            fr: quest.Name_fr
          },
          icon: quest.Icon
        };

        if (quest.OtherReward) {
          const itemId = Object.keys(itemNames).find(key => itemNames[key].en === quest.OtherReward.Name_en);
          if (itemId) {
            quests[quest.ID].rewards = quests[quest.ID].rewards || [];
            quests[quest.ID].rewards.push({
              id: +itemId,
              amount: 1
            });
          }
        }

        Object.keys(quest).forEach(key => {
          const ItemRewardResult = key.match(/^ItemReward(\d{1,3})$/);
          let baseKey = 'Item';
          let i = '';
          if (ItemRewardResult) {
            i = ItemRewardResult[1];
          } else {
            const OptionalItemRewardResult = key.match(/^OptionalItemReward(\d{1,3})$/);
            if (OptionalItemRewardResult) {
              i = OptionalItemRewardResult[1];
              baseKey = 'OptionalItem';
            } else {
              return;
            }
          }
          const reward = quest[`${baseKey}Reward${i}`];
          const rewardType = quest[`${baseKey}Reward${i}Target`] || quest[`${baseKey}Reward${i.replace('0', '')}Target`];
          if (!reward || reward.ID === 0) {
            return;
          }
          switch (rewardType) {
            case 'QuestClassJobReward':
              reward.forEach(questReward => {
                // If it's a trade
                if (questReward.RequiredAmount0 > 0) {
                  quests[quest.ID].trades = quests[quest.ID].trades || [];
                  quests[quest.ID].trades.push({
                    currencies: [0, 1, 2, 3].map(rewardIndex => {
                      const id = questReward[`RequiredItem${rewardIndex}TargetID`];
                      const amount = +questReward[`RequiredAmount${rewardIndex}`];
                      if (id > 0) {
                        usedInQuests[id] = [...usedInQuests[id] || [], quest.ID];
                      }
                      return {
                        id,
                        amount
                      };
                    }).filter(e => e.amount > 0),
                    items: [0, 1, 2, 3].map(rewardIndex => {
                      return {
                        id: questReward[`RewardItem${rewardIndex}TargetID`],
                        amount: +questReward[`RewardAmount${rewardIndex}`]
                      };
                    }).filter(e => e.amount > 0)
                  });
                } else {
                  quests[quest.ID].rewards = quests[quest.ID].rewards || [];
                  [0, 1, 2, 3].forEach(rewardIndex => {
                    if (questReward[`RewardItem${rewardIndex}TargetID`] > 0) {
                      quests[quest.ID].rewards.push({
                        id: questReward[`RewardItem${rewardIndex}TargetID`],
                        amount: questReward[`RewardAmount${rewardIndex}`]
                      });
                    }
                  });
                }
                return [questReward];
              });
              break;
            case 'Item':
              quests[quest.ID].rewards = quests[quest.ID].rewards || [];
              const entry: any = {
                id: reward.ID,
                amount: quest[`${baseKey}CountReward${i}`]
              };
              if (quest[`${baseKey === 'Item' ? '' : baseKey}IsHQReward${i}`]) {
                entry.hq = true;
              }
              quests[quest.ID].rewards.push(entry);
              break;
            case 'BeastRankBonus':
            default:
              return;
          }
        });

        for (let i = 0; i < 2; i++) {
          if (quest[`PreviousQuest${i}TargetID`] && quest.IconID !== 71201) {
            nextQuest[quest[`PreviousQuest${i}TargetID`]] = [...(nextQuest[quest[`PreviousQuest${i}TargetID`]] || []), quest.ID];
          }
        }
      });
    }, null, () => {
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

  getName(): string {
    return 'quests';
  }

}
