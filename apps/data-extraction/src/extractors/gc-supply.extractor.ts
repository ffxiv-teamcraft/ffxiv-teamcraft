import { AbstractExtractor } from '../abstract-extractor';
import { XivDataService } from '../xiv/xiv-data.service';
import { combineLatest } from 'rxjs';


export class GcSupplyExtractor extends AbstractExtractor {

  private jobIds = [8, 15, 14, 10, 12, 11, 13, 9, 16, 17, 18];

  protected doExtract(xiv: XivDataService): void {
    const index = {};
    combineLatest([
      this.getSheet<any>(xiv, 'GcSupplyDuty', [
        'SupplyData:Item#', 'SupplyData:ItemCount#'
      ]),
      this.getSheet<any>(xiv, 'GCSupplyDutyReward', [
        'ExperienceSupply', 'SealsProvisioning', 'SealsSupply'
      ])
    ])
    .subscribe(([entries, rewards]) => {
      entries.forEach(row => {
        index[row.index] = {};
        row.SupplyData.forEach((supply, i) => {
          index[row.index][this.jobIds[i]] = supply.Item
            .filter(Boolean)
            .map((item, index) => {
            return {
              itemId: item,
              count: row.SupplyData[i].ItemCount[index],
              reward: {
                xp: rewards[row.index - 1].ExperienceSupply,
                seals: rewards[row.index - 1].SealsSupply
              }
            };
          });
        });
      });
      this.persistToJsonAsset('gc-supply', index);
      this.done();
    });
  }

  getName(): string {
    return 'gc-supply';
  }

}
