import { AbstractExtractor } from '../abstract-extractor';
import { XivDataService } from '../xiv/xiv-data.service';
import { combineLatest } from 'rxjs';


export class GcSupplyExtractor extends AbstractExtractor {

  private jobIds = [8, 15, 14, 10, 12, 11, 13, 9, 16, 17, 18];

  protected doExtract(xiv: XivDataService): void {
    const index = {};
    combineLatest([
      this.getSheet<any>(xiv, 'GcSupplyDuty', [
        'Item#', 'ItemCount#', 'Icon', 'ExperienceSupply', 'SealsSupply'
      ]),
      this.getSheet<any>(xiv, 'GCSupplyDutyReward', [
        'ExperienceSupply', 'SealsProvisioning'
      ])
    ])
    .subscribe(([entries, rewards]) => {
      entries.forEach(row => {
        index[row.index] = {};
        row.Item.forEach((items, i) => {
          index[row.index][this.jobIds[i]] = items
            .filter(Boolean)
            .map((item, index) => {
            return {
              itemId: item,
              count: row.ItemCount[i][index],
              reward: {
                xp: rewards[row.index].ExperienceSupply,
                seals: rewards[row.index].SealsProvisioning
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
