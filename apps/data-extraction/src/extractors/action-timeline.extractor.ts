import { XivDataService } from '../xiv/xiv-data.service';
import { AbstractExtractor } from '../abstract-extractor';

export class ActionTimelineExtractor extends AbstractExtractor {
  protected doExtract(xiv: XivDataService): any {
    const actionTimeline = {};
    this.getSheet(xiv, 'ActionTimeline', ['Key']).subscribe(entries => {
      entries.forEach(entry => {
        actionTimeline[entry.index] = entry.Key;
      });
    }, null, () => {
      this.persistToJsonAsset('action-timeline', actionTimeline);
      this.done();
    });
  }

  getName(): string {
    return 'action-timeline';
  }

}
