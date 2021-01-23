import { AbstractExtractor } from '../abstract-extractor';

export class GatheringBonusesExtractor extends AbstractExtractor {
  protected doExtract(): any {
    const bonuses = {};
    this.getAllPages('https://xivapi.com/GatheringPointBonus?columns=ID,BonusType,Condition,BonusValue,ConditionValue').subscribe(page => {
      page.Results.forEach(bonus => {
        bonuses[bonus.ID] = {
          value: bonus.BonusValue,
          conditionValue: bonus.ConditionValue
        };
        if (bonus.BonusType) {
          bonuses[bonus.ID].bonus = {
            en: bonus.BonusType.Text_en,
            de: bonus.BonusType.Text_de,
            ja: bonus.BonusType.Text_ja,
            fr: bonus.BonusType.Text_fr
          };
        }
        if (bonus.Condition) {
          bonuses[bonus.ID].condition = {
            en: bonus.Condition.Text_en,
            de: bonus.Condition.Text_de,
            ja: bonus.Condition.Text_ja,
            fr: bonus.Condition.Text_fr
          };
        }
      });
    }, null, () => {
      this.persistToJsonAsset('gathering-bonuses', bonuses);
      this.done();
    });
  }

  getName(): string {
    return 'gathering-bonuses';
  }

}
