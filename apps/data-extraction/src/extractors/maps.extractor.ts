import { combineLatest } from 'rxjs';
import { XivDataService } from '../xiv/xiv-data.service';
import { AbstractExtractor } from '../abstract-extractor';

export class MapsExtractor extends AbstractExtractor {
  protected doExtract(xiv: XivDataService): any {
    const maps = {};
    combineLatest([
      this.getSheet<any>(xiv, 'Map', ['PriorityUI', 'Id', 'MapIndex', 'PlaceNameSub', 'Hierarchy', 'MapFilename', 'OffsetX', 'OffsetY', 'MapMarkerRange', 'PlaceName', 'PlaceNameRegion', 'PlaceNameSub', 'SizeFactor', 'TerritoryType']),
      this.getSheet<any>(xiv, 'TerritoryType', ['OffsetZ']),
      this.getSheet<any>(xiv, 'ContentFinderCondition', ['TerritoryType.Name']),
      this.getSheet<any>(xiv, 'HousingMapMarkerInfo', ['Map#'])
    ]).subscribe(([xivapiMaps, territories, contentFinderConditions, housingMapMarkerInfo]) => {
      xivapiMaps.forEach(mapData => {
        const [folder, layer] = mapData.Id.split('/');
        const filename = `/m/${folder}/${folder}.${layer}.jpg`;


        const territory = territories.find(t => t.index === mapData.TerritoryType);
        const offsetZ = territory && +territory.OffsetZ;
        maps[mapData.index] = {
          id: mapData.index,
          hierarchy: mapData.Hierarchy,
          priority_ui: mapData.PriorityUI,
          image: `https://xivapi.com${filename}`,
          offset_x: +mapData.OffsetX,
          offset_y: +mapData.OffsetY,
          offset_z: offsetZ === -10000 ? 0 : offsetZ,
          map_marker_range: mapData.MapMarkerRange,
          placename_id: mapData.PlaceName,
          placename_sub_id: mapData.PlaceNameSub,
          region_id: mapData.PlaceNameRegion,
          zone_id: mapData.PlaceNameSub,
          size_factor: mapData.SizeFactor,
          territory_id: mapData.TerritoryType,
          index: mapData.MapIndex,
          dungeon: contentFinderConditions.some(c => folder === c.TerritoryType.Name),
          housing: housingMapMarkerInfo.some(marker => marker.Map === mapData.index)
        };
      });
      this.persistToJsonAsset('maps', maps);
      this.done();
    });
  }

  getName(): string {
    return 'maps';
  }

}
