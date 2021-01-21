import { AbstractExtractor } from '../abstract-extractor';

export class QuestsExtractor extends AbstractExtractor {
  protected doExtract(): any {
    const quests = {};
    const nextQuest = {};
    const questChainLengths = {};
    this.getAllPages('https://xivapi.com/Quest?columns=ID,Name_*,Icon,PreviousQuest0TargetID,PreviousQuest1TargetID,PreviousQuest2TargetID,IconID').subscribe(page => {
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
      this.persistToTypescript('quests-chain-lengths', 'questChainLengths', questChainLengths);
      this.done();
    });
  }

  getName(): string {
    return 'quests';
  }

}
