import { AbstractExtractor } from '../abstract-extractor';
import { XivDataService } from '../xiv/xiv-data.service';

export class AirshipRanksExtractor extends AbstractExtractor {

  protected doExtract(xiv: XivDataService): any {
    const ranks = {};

    this.getSheet(xiv, 'AirshipExplorationLevel', ['Capacity', 'ExpToNext']).pipe(
    ).subscribe((entries) => {
      entries.forEach((result) => {
        ranks[result.index] = {
          id: result.index,
          capacity: result.Capacity,
          expToNext: result.ExpToNext
        };
      });
      this.persistToJsonAsset('airship-ranks', ranks);
      this.done();
    });
  }

  getName(): string {
    return 'airship-ranks';
  }

}
