import { AbstractExtractor } from './abstract-extractor';
import { DataType } from '../data-type';
import { LazyDataFacade } from '../../../../lazy-data/+state/lazy-data.facade';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IslandAnimal } from '../../model/island-animal';
import { LazyIslandAnimal } from '../../../../lazy-data/model/lazy-island-animal';

export class IslandPastureExtractor extends AbstractExtractor<IslandAnimal[]> {

  constructor(private lazyData: LazyDataFacade) {
    super();
  }

  isAsync(): boolean {
    return true;
  }

  getDataType(): DataType {
    return DataType.ISLAND_PASTURE;
  }

  protected doExtract(itemId: number): Observable<IslandAnimal[]> {
    return this.lazyData.getEntry('islandAnimals').pipe(
      map((animals) => {
        return Object.values<LazyIslandAnimal>(animals)
          .filter(animal => {
            return animal.rewards.some(reward => reward === itemId);
          })
          .map(animal => {
            return {
              id: animal.id
            };
          });
      })
    );
  }
}
