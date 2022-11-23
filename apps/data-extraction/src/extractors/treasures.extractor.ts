import { AbstractExtractor } from '../abstract-extractor';
import { combineLatest } from 'rxjs';
import { XivDataService } from '../xiv/xiv-data.service';

export class TreasuresExtractor extends AbstractExtractor {
  protected doExtract(xiv: XivDataService): any {
    const treasures = [];
    combineLatest([
      this.getSheet<any>(xiv, 'TreasureSpot', [
        'Location.X', 'Location.Y', 'Location.Z', 'Location.Map.SizeFactor', 'Location.Map.OffsetY', 'Location.Map.OffsetX',
        'MapOffsetX', 'MapOffsetY'
      ], false, 2),
      this.getSheet(xiv, 'TreasureHuntRank', ['MaxPartySize', 'ItemName'])
    ]).subscribe(([treasureRows, ranks]) => {
      treasureRows
        .filter(treasure => !!treasure.Location)
        .forEach(treasure => {
          const rawCoords = {
            x: Math.floor(+treasure.Location.X * 100) / 100,
            y: Math.floor(+treasure.Location.Z * 100) / 100,
            z: Math.floor(+treasure.Location.Y * 100) / 100
          };
          const coords = this.getCoords(rawCoords,
            {
              size_factor: treasure.Location.Map.SizeFactor,
              offset_y: treasure.Location.Map.OffsetY,
              offset_x: treasure.Location.Map.OffsetX,
              offset_z: 0
            }
          );
          const rank = ranks.find(r => r.index === treasure.index);
          treasures.push({
            id: this.getCompositeID(treasure),
            coords: coords,
            rawCoords,
            map: treasure.Location.Map.index,
            partySize: rank.MaxPartySize,
            item: rank.ItemName
          });
        });
      this.persistToJsonAsset('treasures', treasures);
      this.done();
    });
  }

  getName(): string {
    return 'treasures';
  }

}
