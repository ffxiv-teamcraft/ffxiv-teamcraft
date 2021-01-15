import { AbstractExtractor } from '../abstract-extractor';

export class ParamGrowExtractor extends AbstractExtractor {
  protected doExtract(): any {
    const paramGrow = {};
    this.getAllPages('https://xivapi.com/Paramgrow?columns=AdditionalActions,ApplyAction,BaseSpeed,CraftingLevel,ExpToNext,GameContentLinks,HpModifier,HuntingLogExpReward,ID,ItemLevelSync,LevelModifier,MonsterNoteSeals,MpModifier,Patch,ProperDungeon,ProperGuildOrder,QuestExpModifier,ScaledQuestXP').subscribe(page => {
      page.Results.forEach(entry => {
        paramGrow[entry.ID] = entry;
      });
    }, null, () => {
      this.persistToJsonAsset('param-grow', paramGrow);
      this.done();
    });
  }

  getName(): string {
    return 'param-grow';
  }

}
