import { AbstractExtractor } from '../abstract-extractor';

export class InstancesExtractor extends AbstractExtractor {
  protected doExtract(): any {
    const instances = {};
    this.getAllPages('https://xivapi.com/InstanceContent?columns=ID,ContentFinderCondition.Name_*,Icon,InstanceContentTextDataBossEndTargetID,InstanceContentTextDataBossStartTargetID,InstanceContentTextDataObjectiveEndTargetID,InstanceContentTextDataObjectiveStartTargetID').subscribe(page => {
      page.Results.forEach(instance => {
        instances[instance.ID] = {
          en: instance.ContentFinderCondition.Name_en,
          ja: instance.ContentFinderCondition.Name_ja,
          de: instance.ContentFinderCondition.Name_de,
          fr: instance.ContentFinderCondition.Name_fr,
          icon: instance.Icon
        };
        const contentText = [
          instance.InstanceContentTextDataBossEndTargetID,
          instance.InstanceContentTextDataBossStartTargetID,
          instance.InstanceContentTextDataObjectiveEndTargetID,
          instance.InstanceContentTextDataObjectiveStartTargetID
        ].filter(id => id > 0);
        if (contentText.length > 0) {
          instances[instance.ID].contentText = contentText;
        }
      });
    }, null, () => {
      this.persistToJsonAsset('instances', instances);
      this.done();
    });
  }

  getName(): string {
    return 'instances';
  }

}
