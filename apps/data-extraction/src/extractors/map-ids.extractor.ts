import { AbstractExtractor } from '../abstract-extractor';

export class MapIdsExtractor extends AbstractExtractor {

  doExtract(): void {
    const mapIds = [];

    this.getAllPages('https://xivapi.com/map?columns=ID,PlaceName.Name_en,PlaceName.ID,TerritoryType.WeatherRate,TerritoryTypeTargetID,SizeFactor')
      .subscribe({
        next: res => {
          res.Results.forEach(map => {
            mapIds.push({
              id: +map.ID,
              zone: +map.PlaceName.ID,
              name: map.PlaceName.Name_en,
              territory: +map.TerritoryTypeTargetID,
              scale: +map.SizeFactor,
              weatherRate: map.TerritoryType.WeatherRate
            });
          });
        },
        complete: () => {
          this.persistToTypescript('map-ids', 'mapIds', mapIds);
          this.done();
        }
      });
  }

  getName(): string {
    return 'map-ids';
  }

}
