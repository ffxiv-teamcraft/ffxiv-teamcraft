import { XivDataService } from '../xiv/xiv-data.service';
import { AbstractExtractor } from '../abstract-extractor';
import { combineLatest } from 'rxjs';

export class NpcsExtractor extends AbstractExtractor {
  protected doExtract(xiv: XivDataService): any {
    const npcs = {};
    combineLatest([
      this.getSheet(xiv, 'ENpcResident', ['Singular', 'Title']),
      this.getSheet<any>(xiv, 'ENpcBase', ['Balloon#', 'ENpcData#'])
    ]).subscribe(([eNpcResidents, eNpcBases]) => {
      eNpcResidents.forEach(npc => {
        const base = eNpcBases.find(b => b.index === npc.index);
        const defaultTalks = base.ENpcData.filter(d => d > 589800 && d < 601000);
        npcs[npc.index] = {
          ...npcs[npc.index],
          en: npc.Singular_en,
          ja: npc.Singular_ja,
          de: npc.Singular_de,
          fr: npc.Singular_fr,
          title: {
            en: npc.Title_en,
            ja: npc.Title_ja,
            de: npc.Title_de,
            fr: npc.Title_fr
          },
          defaultTalks
        };
        if (base.Balloon > 0) {
          npcs[npc.index].balloon = npc.Balloon;
        }
      });
      this.persistToJsonAsset('npcs', npcs);
      this.done();
    });
  }

  getName(): string {
    return 'npcs';
  }

}
