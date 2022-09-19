import { AbstractExtractor } from './abstract-extractor';
import { DataType } from '../data-type';
import { GardeningData } from '../../model/gardening-data';
import { combineLatest, Observable, of } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, map, switchMap } from 'rxjs/operators';
import { LazyDataFacade } from '../../../../lazy-data/+state/lazy-data.facade';
import { withLazyData } from '../../../../core/rxjs/with-lazy-data';

export class GardeningExtractor extends AbstractExtractor<GardeningData> {

  constructor(private lazyData: LazyDataFacade,
              private http: HttpClient) {
    super();
  }

  isAsync(): boolean {
    return true;
  }

  getDataType(): DataType {
    return DataType.GARDENING;
  }

  extractsArray(): boolean {
    return true;
  }

  protected doExtract(itemId: number): Observable<GardeningData> {
    return combineLatest([
      this.lazyData.getRow('seeds', itemId),
      this.lazyData.getRow('gardeningSources', itemId)
    ]).pipe(
      withLazyData(this.lazyData, 'gardeningSeedIds'),
      switchMap(([[entry, reportSeeds], gardeningSeedIds]) => {
        if (reportSeeds) {
          return of({
            seedItemId: reportSeeds[0],
            duration: 0,
            crossBreeds: []
          });
        } else if (!entry) {
          return of(null);
        }
        const params: HttpParams = new HttpParams().append('seedId', entry.ffxivgId);
        return this.http.get<any[]>('https://us-central1-ffxivteamcraft.cloudfunctions.net/ffxivgardening-api', { params }).pipe(
          map(crosses => {
            return {
              seedItemId: entry.seed,
              // If duration > 10, then it's in hours, but we want to convert everything to hours.
              duration: entry.duration <= 10 ? entry.duration * 24 : entry.duration,
              crossBreeds: crosses.sort((a, b) => {
                return this.getScore(a) - this.getScore(b);
              }).map(cross => {
                return {
                  adjacentSeed: gardeningSeedIds[cross.AdjacentID],
                  baseSeed: gardeningSeedIds[cross.HarvestedID]
                };
              })
            };
          }),
          catchError(() => of(null))
        );
      })
    );
  }

  private getScore(entry: any): number {
    return +entry.HarvestedAvail + +entry.AdjacentAvail
      + +entry.HarvestedCost + +entry.AdjacentCost
      + +entry.HarvestedGrow + +entry.AdjacentGrow;
  }

}
