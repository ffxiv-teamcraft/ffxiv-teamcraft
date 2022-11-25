import { XivDataService } from '../xiv/xiv-data.service';
import { AbstractExtractor } from '../abstract-extractor';

export class GatheringBonusesExtractor extends AbstractExtractor {
  protected doExtract(xiv: XivDataService): any {
    const bonuses = {};
    this.getSheet<any>(xiv, 'GatheringPointBonus', ['BonusType.Text', 'Condition.Text', 'BonusValue#', 'ConditionValue#'], false, 1)
      .subscribe(entries => {
        entries.forEach(bonus => {
          bonuses[bonus.index] = {
            value: bonus.BonusValue,
            conditionValue: bonus.ConditionValue
          };
          if (bonus.BonusType?.index > 0) {
            bonuses[bonus.index].bonus = {
              en: bonus.BonusType.Text_en,
              de: bonus.BonusType.Text_de,
              ja: bonus.BonusType.Text_ja,
              fr: bonus.BonusType.Text_fr
            };
          }
          if (bonus.Condition?.index > 0) {
            bonuses[bonus.index].condition = {
              en: bonus.Condition.Text_en,
              de: bonus.Condition.Text_de,
              ja: bonus.Condition.Text_ja,
              fr: bonus.Condition.Text_fr
            };
          }
        });
        this.persistToJsonAsset('gathering-bonuses', bonuses);
        this.done();
      });
  }

  getName(): string {
    return 'gathering-bonuses';
  }

}
