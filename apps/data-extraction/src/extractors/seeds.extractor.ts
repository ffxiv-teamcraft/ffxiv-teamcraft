import { AbstractExtractor } from '../abstract-extractor';

interface SeedIdEntry {
  SeedID: string;
  SeedName: string;
  Duration: string;
  ApiID_seed: string;
  ApiID_plant: string;
}

export class SeedsExtractor extends AbstractExtractor {
  protected doExtract(): any {
    const entries = {};
    const gardeningSeedIds = {};
    this.getNonXivapiUrl<SeedIdEntry[]>('https://www.ffxivgardening.com/seed-ids').subscribe(seedIds => {
      seedIds.forEach(entry => {
        entries[+entry.ApiID_plant] = {
          seed: +entry.ApiID_seed,
          duration: +entry.Duration,
          ffxivgId: +entry.SeedID
        };
        gardeningSeedIds[entry.SeedID] = +entry.ApiID_seed;
      });
    }, null, () => {
      this.persistToJsonAsset('seeds', entries);
      this.persistToJsonAsset('gardening-seed-ids', gardeningSeedIds);
      this.done();
    });
  }

  getName(): string {
    return 'seeds';
  }

}
