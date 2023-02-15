import { DataType, GardeningData } from '@ffxiv-teamcraft/types';
import { AbstractItemDetailsExtractor } from './abstract-item-details-extractor';

export class GardeningExtractor extends AbstractItemDetailsExtractor<GardeningData> {
  gardeningSources = this.requireLazyFile('gardeningSources');

  seeds = this.requireLazyFile('seeds');

  doExtract(itemId: number): GardeningData {
    if (this.seeds[itemId]) {
      return this.seeds[itemId];
    }
    const reportSeeds = this.gardeningSources[itemId];
    if (reportSeeds) {
      return {
        seedItemId: reportSeeds[0],
        duration: 0,
        crossBreeds: []
      };
    }
  }

  getDataType(): DataType {
    return DataType.GARDENING;
  }

}
