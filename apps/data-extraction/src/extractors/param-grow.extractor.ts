import { XivDataService } from '../xiv/xiv-data.service';
import { AbstractExtractor } from '../abstract-extractor';

export class ParamGrowExtractor extends AbstractExtractor {
  protected doExtract(xiv: XivDataService): any {
    const paramGrow = {};
    this.getSheet(xiv, 'Paramgrow', ['AdditionalActions', 'ApplyAction', 'BaseSpeed', 'CraftingLevel', 'ExpToNext', 'HpModifier', 'HuntingLogExpReward', 'ItemLevelSync', 'LevelModifier', 'MonsterNoteSeals', 'MpModifier', 'ProperDungeon', 'ProperGuildOrder', 'QuestExpModifier', 'ScaledQuestXP'])
      .subscribe(entries => {
        entries.forEach(entry => {
          paramGrow[entry.index] = this.removeIndexes(entry);
        });
        this.persistToJsonAsset('param-grow', paramGrow);
        this.done();
      });
  }

  getName(): string {
    return 'param-grow';
  }

}
