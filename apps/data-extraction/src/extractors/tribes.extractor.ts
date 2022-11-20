import { XivDataService } from '../xiv/xiv-data.service';
import { AbstractExtractor } from '../abstract-extractor';

export class TribesExtractor extends AbstractExtractor {
  protected doExtract(xiv: XivDataService): any {
    const tribes = {};
    this.getSheet<any>(xiv, `Tribe`).subscribe(completeFetch => {
      completeFetch.forEach(entry => {
        delete entry.GamePatch;
        delete entry.Feminine;
        delete entry.Feminine_de;
        delete entry.Feminine_en;
        delete entry.Feminine_fr;
        delete entry.Feminine_ja;
        entry.Name_en = entry.Masculine_en;
        entry.Name_de = entry.Masculine_de;
        entry.Name_ja = entry.Masculine_ja;
        entry.Name_fr = entry.Masculine_fr;
        delete entry.Masculine_en;
        delete entry.Masculine_de;
        delete entry.Masculine_ja;
        delete entry.Masculine_fr;
        tribes[entry.index] = entry;
      });
      this.persistToJsonAsset('tribes', tribes);
      this.done();
    });
  }

  getName(): string {
    return 'tribes';
  }

}
