import { AbstractExtractor } from '../abstract-extractor';

export class ActionTimelineExtractor extends AbstractExtractor {
  protected doExtract(): any {
    const actionTimeline = {};
    this.getAllPages('https://xivapi.com/ActionTimeline?columns=ID,Key').subscribe(page => {
      page.Results.forEach(entry => {
        actionTimeline[entry.ID] = entry.Key;
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
