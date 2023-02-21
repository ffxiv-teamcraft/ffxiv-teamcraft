import { AbstractExtractor } from '../abstract-extractor';
import { map, switchMap } from 'rxjs/operators';
import { combineLatest } from 'rxjs';

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
    this.getNonXivapiUrl<SeedIdEntry[]>('https://www.ffxivgardening.com/seed-ids')
      .pipe(
        switchMap(seeds => {
          return combineLatest(seeds.map(entry => {
            return this.getNonXivapiUrl(`https://us-central1-ffxivteamcraft.cloudfunctions.net/ffxivgardening-api?seedId=${entry.SeedID}`).pipe(
              map(crosses => {
                return {
                  entry,
                  crosses
                };
              })
            );
          }));
        })
      )
      .subscribe((seeds) => {
        seeds.forEach(({ entry }) => {
          gardeningSeedIds[entry.SeedID] = +entry.ApiID_seed;
        });
        seeds.forEach(({ entry, crosses }) => {
          entries[+entry.ApiID_plant] = {
            seedItemId: +entry.ApiID_seed,
            duration: +entry.Duration <= 10 ? +entry.Duration * 24 : +entry.Duration,
            crossBreeds: crosses.sort((a, b) => {
              return this.getScore(a) - this.getScore(b);
            }).map(cross => {
              return {
                adjacentSeed: gardeningSeedIds[cross.AdjacentID],
                baseSeed: gardeningSeedIds[cross.HarvestedID]
              };
            }).slice(0, 3)
          };
        });
      }, null, () => {
        this.persistToJsonAsset('seeds', entries);
        this.done();
      });
  }

  private getScore(entry: any): number {
    return +entry.HarvestedAvail + +entry.AdjacentAvail
      + +entry.HarvestedCost + +entry.AdjacentCost
      + +entry.HarvestedGrow + +entry.AdjacentGrow;
  }

  getName(): string {
    return 'seeds';
  }

}
