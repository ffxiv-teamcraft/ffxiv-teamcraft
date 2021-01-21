import { combineLatest } from 'rxjs';
import { AbstractExtractor } from '../abstract-extractor';
import { first, map } from 'rxjs/operators';

export class HuntsExtractor extends AbstractExtractor {
  protected doExtract(): any {
    const huntZones = [
      134,
      135,
      137,
      138,
      139,
      140,
      141,
      145,
      146,
      147,
      148,
      152,
      153,
      154,
      155,
      156,
      180,
      397,
      398,
      399,
      400,
      401,
      402,
      612,
      620,
      621,
      613,
      614,
      622
    ];
    combineLatest(
      huntZones.map(zone => {
        return this.get(`https://xivhunt.net/api/worlds/SpawnPoints/${zone}`)
          .pipe(
            map(hunt => {
              return {
                zoneid: zone,
                hunts: hunt
              };
            })
          );
      }))
      .pipe(
        first()
      )
      .subscribe(hunts => {
        this.persistToJsonAsset('hunts', hunts);
        this.done();
      });
  }

  getName(): string {
    return 'hunts';
  }

}
