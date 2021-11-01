import { AbstractExtractor } from '../abstract-extractor';
import { combineLatest } from 'rxjs';

export class TreasuresExtractor extends AbstractExtractor {
  protected doExtract(): any {
    const treasures = [];
    combineLatest([
      this.aggregateAllPages('https://xivapi.com/TreasureSpot?columns=ID,Location,MapOffsetX,MapOffsetY'),
      this.aggregateAllPages('https://xivapi.com/TreasureHuntRank?columns=ID,MaxPartySize,ItemNameTargetID')
    ]).subscribe(([treasureRows, ranks]) => {
      treasureRows
        .filter(treasure => !!treasure.Location)
        .forEach(treasure => {
          const rawCoords = {
            x: +treasure.Location.X,
            y: +treasure.Location.Z,
            z: +treasure.Location.Y
          };
          const coords = this.getCoords(rawCoords,
            {
              size_factor: treasure.Location.Map.SizeFactor,
              offset_y: treasure.Location.Map.OffsetY,
              offset_x: treasure.Location.Map.OffsetX,
              offset_z: 0
            }
          );
          const rank = ranks.find(r => r.ID === +treasure.ID.split('.')[0]);
          treasures.push({
            id: treasure.ID,
            coords: coords,
            rawCoords,
            map: treasure.Location.MapTargetID,
            partySize: rank.MaxPartySize,
            item: rank.ItemNameTargetID
          });
        });
    }, null, () => {
      this.persistToJsonAsset('treasures', treasures);
      this.done();
    });
  }

  getName(): string {
    return 'treasures';
  }

}
