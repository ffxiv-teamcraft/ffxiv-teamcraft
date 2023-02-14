import { AbstractItemDetailsExtractor } from './abstract-item-details-extractor';
import { DataType, FateData } from '@ffxiv-teamcraft/types';

export class FatesExtractor extends AbstractItemDetailsExtractor<FateData[]> {
  fateSources = this.requireLazyFile('fateSources');

  fates = this.requireLazyFile('fates');

  doExtract(itemId: number): FateData[] {
    return (this.fateSources[itemId] || [])
      .filter(fate => !!fate)
      .map(fateId => {
        const fateData = this.fates[fateId];
        const fate: FateData = {
          id: fateId,
          level: fateData.level
        };
        if (fateData.position) {
          fate.zoneId = fateData.position.zoneid;
          fate.mapId = fateData.position.map;
          fate.coords = {
            x: fateData.position.x,
            y: fateData.position.y
          };
        }
        return fate;
      });
  }

  getDataType(): DataType {
    return DataType.FATES;
  }

}
