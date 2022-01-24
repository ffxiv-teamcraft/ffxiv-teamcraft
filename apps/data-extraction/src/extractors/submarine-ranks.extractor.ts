import { AbstractExtractor } from '../abstract-extractor';
import { map, tap } from 'rxjs/operators';

export class SubmarineRanksExtractor extends AbstractExtractor {

  protected doExtract(): any {
    const ranks = {};

    this.getAllPages(this.getResourceEndpointWithQuery('SubmarineRank' as any, {
      columns: 'ID,Capacity,ExpToNext,SurveillanceBonus,RetrievalBonus,SpeedBonus,RangeBonus,FavorBonus'
    })).pipe(
      map((page) => page.Results),
      tap((rankResults) => {
        rankResults.forEach((result) => {
          ranks[result.ID] = {
            id: result.ID,
            capacity: result.Capacity,
            expToNext: result.ExpToNext,
            surveillanceBonus: result.SurveillanceBonus,
            retrievalBonus: result.RetrievalBonus,
            speedBonus: result.SpeedBonus,
            rangeBonus: result.RangeBonus,
            favorBonus: result.FavorBonus
          };
        });
      })
    ).subscribe(() => {
      this.persistToJsonAsset('submarine-ranks', ranks);
      this.done();
    });
  }

  getName(): string {
    return 'submarine-ranks';
  }

}
