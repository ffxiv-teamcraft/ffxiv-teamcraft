import { AbstractExtractor } from '../abstract-extractor';
import { map, tap } from 'rxjs/operators';

export class AirshipRanksExtractor extends AbstractExtractor {

  protected doExtract(): any {
    const ranks = {};

    this.getAllPages(this.getResourceEndpointWithQuery('AirshipExplorationLevel' as any, {
      columns: 'ID,Capacity,ExpToNext'
    })).pipe(
      map((page) => page.Results),
      tap((rankResults) => {
        rankResults.forEach((result) => {
          ranks[result.ID] = {
            id: result.ID,
            capacity: result.Capacity,
            expToNext: result.ExpToNext
          };
        });
      })
    ).subscribe(() => {
      this.persistToJsonAsset('airship-ranks', ranks);
      this.done();
    });
  }

  getName(): string {
    return 'airship-ranks';
  }

}
