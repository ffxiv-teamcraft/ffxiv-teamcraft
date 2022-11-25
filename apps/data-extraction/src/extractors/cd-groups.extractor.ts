import { XivDataService } from '../xiv/xiv-data.service';
import { AbstractExtractor } from '../abstract-extractor';

export class CdGroupsExtractor extends AbstractExtractor {
  protected doExtract(xiv: XivDataService): any {
    const groups = {};
    this.getSheet<any>(xiv, 'Action', ['CooldownGroup']).subscribe(entries => {
      entries.forEach(action => {
        groups[action.CooldownGroup] = [
          ...(groups[action.CooldownGroup] || []),
          action.index
        ];
      });
      this.persistToJsonAsset('action-cd-groups', groups);
      this.done();
    });
  }

  getName(): string {
    return 'action-cd-groups';
  }

}
