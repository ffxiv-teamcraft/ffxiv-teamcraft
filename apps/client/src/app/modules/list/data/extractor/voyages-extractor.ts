import { AbstractExtractor } from './abstract-extractor';
import { DataType } from '../data-type';
import { ExplorationType } from '../../../../model/other/exploration-type';
import { VoyageSource } from '../../model/voyage-source';
import { LazyDataFacade } from '../../../../lazy-data/+state/lazy-data.facade';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export class VoyagesExtractor extends AbstractExtractor<VoyageSource[]> {

  constructor(private lazyData: LazyDataFacade) {
    super();
  }

  isAsync(): boolean {
    return true;
  }

  getDataType(): DataType {
    return DataType.VOYAGES;
  }

  protected doExtract(itemId: number): Observable<VoyageSource[]> {
    return combineLatest([
      this.lazyData.getEntry('airshipVoyages'),
      this.lazyData.getEntry('submarineVoyages'),
      this.lazyData.getRow('voyageSources', itemId, [])
    ]).pipe(
      map(([airshipVoyages, submarineVoyages, voyageSource]) => {
        return voyageSource.map(({ type, id }) => {
          return {
            type,
            name: (type === ExplorationType.AIRSHIP ? airshipVoyages : submarineVoyages)[id]
          };
        });
      })
    );
  }

}
