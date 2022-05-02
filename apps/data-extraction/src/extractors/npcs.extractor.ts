import { AbstractExtractor } from '../abstract-extractor';

export class NpcsExtractor extends AbstractExtractor {
  protected doExtract(): any {
    const npcs = {};
    const housingMaterialSuppliers = [];
    this.getAllPages('https://xivapi.com/ENpcResident?columns=ID,Name_*,DefaultTalk,Title_*').subscribe(page => {
      page.Results.forEach(npc => {
        npcs[npc.ID] = {
          ...npcs[npc.ID],
          en: npc.Name_en,
          ja: npc.Name_ja,
          de: npc.Name_de,
          fr: npc.Name_fr,
          title: {
            en: npc.Title_en,
            ja: npc.Title_ja,
            de: npc.Title_de,
            fr: npc.Title_fr
          },
          defaultTalks: (npc.DefaultTalk || []).map(talk => talk.ID)
        };
        if (npc.BalloonTargetID > 0) {
          npcs[npc.ID].balloon = npc.BalloonTargetID;
        }
      });
    }, null, () => {
      this.persistToJsonAsset('npcs', npcs);
      this.done();
    });
  }

  getName(): string {
    return 'npcs';
  }

}
