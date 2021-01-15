import { AbstractExtractor } from '../abstract-extractor';

export class HwdGathererExtractor extends AbstractExtractor {
  protected doExtract(): any {
    const inspections = [];
    this.getAllEntries('https://xivapi.com/HWDGathererInspection').subscribe(completeFetch => {
      completeFetch.forEach(inspection => {
        for (let i = 0; i < 52; i++) {
          if (inspection[`ItemRequired${i}`] === null) {
            return;
          }
          inspections.push({
            requiredItem: inspection[`ItemRequired${i}`].ItemTargetID,
            amount: inspection[`AmountRequired${i}`],
            receivedItem: inspection[`ItemReceived${i}TargetID`],
            scrips: inspection[`Reward1${i}`].Scrips,
            points: inspection[`Reward1${i}`].Points,
            phase: inspection[`Phase${i}TargetID`]
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
