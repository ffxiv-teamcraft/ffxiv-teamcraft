import { AbstractExtractor } from '../abstract-extractor';

const columns = [
  'ID',
  'Name_*',
  'Icon',
  'PreviousQuest0TargetID',
  'PreviousQuest1TargetID',
  'PreviousQuest2TargetID',
  'IconID',
  ...['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14'].map(i => `ItemReward${i}`),
  ...['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14'].map(i => `ItemReward${i}Target`),
  ...['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14'].map(i => `IsHQReward${i}`),
  ...['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14'].map(i => `ItemCountReward${i}`)
];

export class QuestsExtractor extends AbstractExtractor {
  protected doExtract(): any {
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

        ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14'].forEach(i => {
          const reward = quest[`ItemReward${i}`];
          const rewardType = quest[`ItemReward${i}Target`];
          if (!reward) {
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
                    quests[quest.ID].rewards.push({
                      id: questReward[`RewardItem${rewardIndex}TargetID`],
                      amount: questReward[`RewardAmount${rewardIndex}`]
                    });
                  });
                }
                return [questReward];
              });
              break;
            case 'Item':
              quests[quest.ID].rewards = quests[quest.ID].rewards || [];
              const entry: any = {
                id: reward.ID,
                amount: quest[`ItemCountReward${i}`]
              };
              if (quest[`IsHQReward${i}`]) {
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
