import { XivDataService } from '../xiv/xiv-data.service';
import { AbstractExtractor } from '../abstract-extractor';

export class HwdGathererExtractor extends AbstractExtractor {
  protected doExtract(xiv: XivDataService): any {
    const inspections = [];
    this.getSheet<any>(xiv, 'HWDGathererInspection', ['HWDGathererInspectionData:RequiredItem.Item#', 'HWDGathererInspectionData:AmountRequired', 'HWDGathererInspectionData:ItemReceived#', 'HWDGathererInspectionData:Reward.Scrips#', 'HWDGathererInspectionData:Reward.Points#', 'HWDGathererInspectionData:Phase#'], false, 1).subscribe(completeFetch => {
      completeFetch.forEach(inspection => {
        for (const row of inspection.HWDGathererInspectionData) {
          if (row.RequiredItem.Item === 0) {
            continue;
          }
          inspections.push({
            requiredItem: row.RequiredItem.Item,
            amount: row.AmountRequired,
            receivedItem: row.ItemReceived,
            scrips: row.Reward[0].Scrips,
            points: row.Reward[0].Points,
            phase: row.Phase
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
