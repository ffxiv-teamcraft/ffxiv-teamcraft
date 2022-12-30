import { AbstractExtractor } from '../abstract-extractor';
import { XivDataService } from '../xiv/xiv-data.service';

export class SubmarineRanksExtractor extends AbstractExtractor {

  protected doExtract(xiv: XivDataService): any {
    const ranks = {};

    this.getSheet(xiv, 'SubmarineRank')
      .subscribe((entries) => {
        entries.forEach((result) => {
          ranks[result.index] = {
            id: result.index,
            capacity: result.Capacity,
            expToNext: result.ExpToNext,
            surveillanceBonus: result.SurveillanceBonus,
            retrievalBonus: result.RetrievalBonus,
            speedBonus: result.SpeedBonus,
            rangeBonus: result.RangeBonus,
            favorBonus: result.FavorBonus
          };
        });
        this.persistToJsonAsset('submarine-ranks', ranks);
        this.done();
      });
  }

  getName(): string {
    return 'submarine-ranks';
  }

}
