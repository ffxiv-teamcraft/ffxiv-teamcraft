import { AbstractExtractor } from '../abstract-extractor';

export class CdGroupsExtractor extends AbstractExtractor {
  protected doExtract(): any {
    const groups = {};
    this.getAllPages('https://xivapi.com/Action?columns=ID,CooldownGroup').subscribe(page => {
      page.Results.forEach(action => {
        groups[action.CooldownGroup] = [
          ...(groups[action.CooldownGroup] || []),
          action.ID
        ];
      });
    }, null, () => {
      this.persistToJsonAsset('action-cd-groups', groups);
      this.done();
    });
  }

  getName(): string {
    return 'action-cd-groups';
  }

}
