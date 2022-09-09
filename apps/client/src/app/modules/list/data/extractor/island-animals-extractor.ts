import { AbstractExtractor } from './abstract-extractor';
import { DataType } from '../data-type';
import { uniqBy } from 'lodash';
import { LazyDataFacade } from '../../../../lazy-data/+state/lazy-data.facade';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IslandAnimal } from '../../model/island-animal';

export class IslandAnimalsExtractor extends AbstractExtractor<IslandAnimal[]> {

  constructor(private lazyData: LazyDataFacade) {
    super();
  }

  isAsync(): boolean {
    return true;
  }

  getDataType(): DataType {
    return DataType.ISLAND_ANIMAL;
  }

  protected doExtract(itemId: number): Observable<IslandAnimal[]> {
    return this.lazyData.getRow('islandAnimalSources', itemId).pipe(
      map((sources) => {
        if (sources) {
          return uniqBy(sources.map(s => ({ id: s })), 'id');
        }
      })
    );
  }
}
