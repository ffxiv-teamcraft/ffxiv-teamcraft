import { AbstractExtractor } from '../abstract-extractor';
import { XivDataService } from '../xiv/xiv-data.service';
import { combineLatest } from 'rxjs';

export class TraitsExtractor extends AbstractExtractor {
  protected doExtract(xiv: XivDataService): any {
    const traits = {};
    combineLatest([
      this.getSheet(xiv, 'Trait', ['Name_*', 'Description_*', 'Icon']),
      this.getSheet(xiv, 'TraitTransient', ['Description_*'])
    ]).subscribe(([rows, transientRows]) => {
      rows.forEach((trait, i) => {
        traits[trait.index] = {
          en: trait.Name_en,
          de: trait.Name_de,
          ja: trait.Name_ja,
          fr: trait.Name_fr,
          icon: trait.Icon,
          description: {
            en: transientRows[i].Description_en,
            de: transientRows[i].Description_de,
            ja: transientRows[i].Description_ja,
            fr: transientRows[i].Description_fr
          }
        };
      });
      delete traits[0];
      this.persistToJsonAsset('traits', traits);
      this.done();
    });
  }

  getName(): string {
    return 'traits';
  }

}
