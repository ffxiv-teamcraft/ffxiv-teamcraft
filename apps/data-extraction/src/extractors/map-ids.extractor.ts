import { AbstractExtractor } from '../abstract-extractor';
import { XivDataService } from '../xiv/xiv-data.service';

export class MapIdsExtractor extends AbstractExtractor {

  doExtract(xiv: XivDataService): void {
    const mapIds = [];

    this.getSheet<any>(xiv, 'Map', ['PlaceName.Name', 'TerritoryType.WeatherRate', 'SizeFactor'], false, 1)
      .subscribe(entries => {
        entries
          .forEach(map => {
            mapIds.push({
              id: +map.index,
              zone: +map.PlaceName.index,
              name: map.PlaceName.Name_en,
              territory: +map.TerritoryType?.index ?? 0,
              scale: +map.SizeFactor,
              weatherRate: map.TerritoryType?.WeatherRate ?? null
            });
          });
        this.persistToTypescript('map-ids', 'mapIds', mapIds);
        this.persistToJsonAsset('map-entries', mapIds);
        this.done();
      });
  }

  getName(): string {
    return 'map-ids';
  }

}
