import { AbstractExtractor } from '../abstract-extractor';

export class AetherytesExtractor extends AbstractExtractor {
  protected doExtract(): any {
    const names = {};
    this.getAllPages('https://xivapi.com/Aetheryte?columns=ID,AethernetName.Name_*,AetherstreamX,AetherstreamY').subscribe(page => {
      page.Results.forEach(aetheryte => {
        if (aetheryte.AethernetName.Name_en === null) {
          return;
        }
        names[aetheryte.ID] = {
          en: aetheryte.AethernetName.Name_en,
          de: aetheryte.AethernetName.Name_de,
          ja: aetheryte.AethernetName.Name_ja,
          fr: aetheryte.AethernetName.Name_fr
        };
      });
    }, null, () => {
      this.persistToTypescript('aetheryte-names', 'aetheryteNames', names);
      this.done();
    });
  }

  getName(): string {
    return 'aetherytes';
  }

}
