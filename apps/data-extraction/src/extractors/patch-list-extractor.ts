import { AbstractExtractor } from '../abstract-extractor';

export class PatchListExtractor extends AbstractExtractor {
  protected doExtract(): void {
    this.get('https://raw.githubusercontent.com/xivapi/ffxiv-datamining-patches/master/patchlist.json').subscribe(patches => {
      this.persistToJsonAsset('patch-names', patches.reduce((acc, p) => {
        return {
          ...acc,
          [p.ID]: {
            id: p.ID,
            banner: p.Banner,
            ex: p.ExVersion,
            release: p.ReleaseDate,
            en: p.Name_en,
            de: p.Name_de,
            ja: p.Name_ja,
            fr: p.Name_fr,
            ko: p.Name_kr,
            zh: p.Name_cn,
            version: p.Version
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
