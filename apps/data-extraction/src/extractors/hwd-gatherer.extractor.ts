import { XivDataService } from '../xiv/xiv-data.service';
import { AbstractExtractor } from '../abstract-extractor';

export class HwdGathererExtractor extends AbstractExtractor {
  protected doExtract(xiv: XivDataService): any {
    const inspections = [];
    this.getSheet<any>(xiv, 'HWDGathererInspection', ['ItemRequired.Item#', 'AmountRequired', 'ItemReceived#', 'Reward1.Scrips#', 'Reward1.Points#', 'Phase#'], false, 1).subscribe(completeFetch => {
      completeFetch.forEach(inspection => {
        for (const row of inspection.ItemRequired) {
          const index = inspection.ItemRequired.indexOf(row);
          if (row.Item === 0) {
            continue;
          }
          inspections.push({
            requiredItem: row.Item,
            amount: inspection.AmountRequired[index],
            receivedItem: inspection.ItemReceived[index],
            scrips: inspection.Reward1[index].Scrips,
            points: inspection.Reward1[index].Points,
            phase: inspection.Phase[index]
          });
        }
      });
      this.persistToJsonAsset('hwd-inspections', inspections);
      this.done();
    });
  }

  getName(): string {
    return 'HWDGatherer';
  }

}
