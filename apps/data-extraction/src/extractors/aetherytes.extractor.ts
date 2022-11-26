import { XivDataService } from '../xiv/xiv-data.service';
import { AbstractExtractor } from '../abstract-extractor';

export class AetherytesExtractor extends AbstractExtractor {
  protected doExtract(xiv: XivDataService): any {
    const names = {};
    this.getSheet<any>(xiv, 'Aetheryte', ['AethernetName.Name'], false, 1)
      .subscribe(entries => {
        entries.forEach(aetheryte => {
          if (aetheryte.AethernetName.Name === '') {
            return;
          }
          names[aetheryte.index] = {
            en: aetheryte.AethernetName.Name_en,
            de: aetheryte.AethernetName.Name_de,
            ja: aetheryte.AethernetName.Name_ja,
            fr: aetheryte.AethernetName.Name_fr
          };
        });
        this.persistToTypescript('aetheryte-names', 'aetheryteNames', names);
        this.done();
      });
  }

  getName(): string {
    return 'aetherytes';
  }

}
