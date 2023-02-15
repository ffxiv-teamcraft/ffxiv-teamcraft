import { LazyIslandAnimal } from '@ffxiv-teamcraft/data/model/lazy-island-animal';
import { AbstractItemDetailsExtractor } from './abstract-item-details-extractor';
import { DataType, IslandAnimal } from '@ffxiv-teamcraft/types';

export class IslandPastureExtractor extends AbstractItemDetailsExtractor<IslandAnimal[]> {
  animals = this.requireLazyFile('islandAnimals');

  doExtract(itemId: number): IslandAnimal[] {
    return Object.values<LazyIslandAnimal>(this.animals)
      .filter(animal => {
        return animal.rewards.some(reward => reward === itemId);
      })
      .map(animal => {
        return {
          id: animal.id
        };
      });
  }


  getDataType(): DataType {
    return DataType.ISLAND_PASTURE;
  }
}
