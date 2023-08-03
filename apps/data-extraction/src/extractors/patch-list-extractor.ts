import { AbstractExtractor } from '../abstract-extractor';

export class PatchListExtractor extends AbstractExtractor {
  protected doExtract(): void {
    this.get('https://xivapi.com/patchlist').subscribe(patches => {
      this.persistToJsonAsset('patch-names', patches.reduce((acc, p) => {
        return {
          ...acc,
          [p.ID]: {
            en: p.Name_en,
            de: p.Name_de,
            ja: p.Name_ja,
            fr: p.Name_fr,
            ko: p.Name_kr,
            zh: p.Name_cn
          }
        };
      }, {}));
      this.done();
    });
  }

  getName(): string {
    return 'Patch names';
  }

}
