import { DataType, ExplorationType, VoyageSource } from '@ffxiv-teamcraft/types';
import { AbstractItemDetailsExtractor } from './abstract-item-details-extractor';
import { uniqBy } from 'lodash';

export class VoyagesExtractor extends AbstractItemDetailsExtractor<VoyageSource[]> {
  airshipVoyages = this.requireLazyFile('airshipVoyages');

  submarineVoyages = this.requireLazyFile('submarineVoyages');

  voyageSources = this.requireLazyFile('voyageSources');

  doExtract(itemId: number): VoyageSource[] {
    return uniqBy((this.voyageSources[itemId] || []), e => `${e.type}:${e.id}`).map(({ type, id }) => {
      return {
        type,
        name: (type === ExplorationType.AIRSHIP ? this.airshipVoyages : this.submarineVoyages)[id]
      };
    }).filter(e => !!e.name);
  }

  getDataType(): DataType {
    return DataType.REDUCED_FROM;
  }

}
