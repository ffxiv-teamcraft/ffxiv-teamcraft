import { AbstractExtractor } from '../abstract-extractor';
import { XivDataService } from '../xiv/xiv-data.service';

export class InstancesExtractor extends AbstractExtractor {
  protected doExtract(xiv: XivDataService): any {
    const instances = {};
    this.getSheet<any>(xiv, 'ContentFinderCondition', [
      'Name', 'Icon', 'ContentLinkType', 'ContentType.Icon',
      'Content.InstanceContentTextDataBossEnd#', 'Content.InstanceContentTextDataBossStart#', 'Content.InstanceContentTextDataObjectiveEnd#', 'Content.InstanceContentTextDataObjectiveStart#'
    ], false, 2)
      .subscribe((entries) => {
        entries.forEach(cfc => {
          if (!cfc.Content || cfc.Content.__sheet !== 'InstanceContent') {
            return;
          }
          instances[cfc.Content.index] = {
            en: cfc.Name_en,
            ja: cfc.Name_ja,
            de: cfc.Name_de,
            fr: cfc.Name_fr,
            icon: cfc?.ContentType?.Icon
          };
          const contentText = [
            cfc.Content.InstanceContentTextDataBossEnd,
            cfc.Content.InstanceContentTextDataBossStart,
            cfc.Content.InstanceContentTextDataObjectiveEnd,
            cfc.Content.InstanceContentTextDataObjectiveStart
          ].filter(id => id > 0);
          if (contentText.length > 0) {
            instances[cfc.Content.index].contentText = contentText;
          }
        });
        this.persistToJsonAsset('instances', instances);
        this.done();
      });
  }

  getName(): string {
    return 'instances';
  }

}
