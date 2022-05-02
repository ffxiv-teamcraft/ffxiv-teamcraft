import { combineLatest } from 'rxjs';
import { AbstractExtractor } from '../abstract-extractor';

export class MapsExtractor extends AbstractExtractor {
  protected doExtract(): any {
    const maps = {};
    combineLatest([
      this.aggregateAllPages('https://xivapi.com/Map?columns=ID,GameContentLinks,PriorityUI,MapFilenameId,MapIndex,PlaceNameSubTargetID,Hierarchy,MapFilename,OffsetX,OffsetY,MapMarkerRange,PlaceNameTargetID,PlaceNameRegionTargetID,PlaceNameSubTargetID,SizeFactor,TerritoryTypeTargetID'),
      this.aggregateAllPages('https://xivapi.com/TerritoryType?columns=ID,OffsetZ'),
      this.aggregateAllPages('https://xivapi.com/ContentFinderCondition?columns=TerritoryType.Name')
    ]).subscribe(([xivapiMaps, territories, contentFinderConditions]) => {
      xivapiMaps.forEach(mapData => {
        const territory = territories.find(t => t.ID === mapData.TerritoryTypeTargetID);
        const offsetZ = territory && +territory.OffsetZ;
        maps[mapData.ID] = {
          id: mapData.ID,
          hierarchy: mapData.Hierarchy,
          priority_ui: mapData.PriorityUI,
          image: `https://xivapi.com${mapData.MapFilename}`,
          offset_x: +mapData.OffsetX,
          offset_y: +mapData.OffsetY,
          offset_z: offsetZ === -10000 ? 0 : offsetZ,
          map_marker_range: mapData.MapMarkerRange,
          placename_id: mapData.PlaceNameTargetID,
          placename_sub_id: mapData.PlaceNameSubTargetID,
          region_id: mapData.PlaceNameRegionTargetID,
          zone_id: mapData.PlaceNameSubTargetID,
          size_factor: mapData.SizeFactor,
          territory_id: mapData.TerritoryTypeTargetID,
          index: mapData.MapIndex,
          dungeon: contentFinderConditions.some(c => mapData.MapFilenameId.startsWith(c.TerritoryType.Name)),
          housing: mapData.GameContentLinks.HousingMapMarkerInfo !== undefined
        };
      });
    }, null, () => {
      this.persistToJsonAsset('maps', maps);
      this.done();
    });
  }

  getName(): string {
    return 'maps';
  }

}
