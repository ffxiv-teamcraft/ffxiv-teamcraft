import { AbstractExtractor } from '../abstract-extractor';
import { XivDataService } from '../xiv/xiv-data.service';
import { combineLatest } from 'rxjs';
import { makeIcon } from '../xiv/make-icon';

export class InstancesExtractor extends AbstractExtractor {
  protected doExtract(xiv: XivDataService): any {
    const instances = {};
    combineLatest([
      this.getSheet<any>(xiv, 'ContentFinderCondition', [
        'Name', 'Icon', 'ContentLinkType', 'ContentType.Icon', 'Image', 'ClassJobLevelSync', 'ItemLevelRequired', 'ClassJobLevelRequired',
        'Content.InstanceContentTextDataBossEnd#', 'Content.InstanceContentTextDataBossStart#', 'Content.InstanceContentTextDataObjectiveEnd#', 'Content.InstanceContentTextDataObjectiveStart#',
        'ContentMemberType', 'Content.InstanceClearExp#', 'TimeLimitMin', 'TerritoryType.Map#'
      ], false, 2),
      this.getSheet<any>(xiv, 'ContentFinderConditionTransient', [
        'Description'
      ]),
      this.getNonXivapiUrl('https://raw.githubusercontent.com/xivapi/ffxiv-datamining-patches/master/patchdata/InstanceContent.json')
    ]).subscribe(([entries, cfcTransients, patches]) => {
      entries.forEach(cfc => {
        if (!cfc.Content || cfc.Content.__sheet !== 'InstanceContent') {
          return;
        }
        const transient = cfcTransients.find(e => e.index === cfc.index);
        instances[cfc.Content.index] = {
          id: cfc.Content.index,
          en: cfc.Name_en,
          ja: cfc.Name_ja,
          de: cfc.Name_de,
          fr: cfc.Name_fr,
          description: transient?.Description_en?.length > 1 ? {
            en: transient?.Description_en,
            ja: transient?.Description_ja,
            de: transient?.Description_de,
            fr: transient?.Description_fr
          } : null,
          members: {
            HealersPerParty: cfc?.ContentMemberType?.HealersPerParty,
            MeleesPerParty: cfc?.ContentMemberType?.MeleesPerParty,
            RangedPerParty: cfc?.ContentMemberType?.RangedPerParty,
            TanksPerParty: cfc?.ContentMemberType?.TanksPerParty
          },
          icon: cfc?.ContentType?.Icon,
          banner: makeIcon(cfc?.Image),
          gamePatch: patches[cfc.Content.index],
          contentType: cfc?.ContentType?.index,
          timeLimit: cfc?.TimeLimitMin,
          levelReq: cfc?.ClassJobLevelRequired,
          ilvlReq: cfc?.ItemLevelRequired,
          sync: cfc?.ClassJobLevelSync,
          exp: cfc?.Content?.InstanceClearExp,
          weekRestriction: cfc?.WeekRestriction,
          map: cfc?.TerritoryType?.Map
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
