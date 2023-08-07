import { AbstractExtractor } from '../../abstract-extractor';
import { XivDataService } from '../../xiv/xiv-data.service';
import { LazyPlace } from '@ffxiv-teamcraft/data/model/lazy-place';

export class FishingSpotsDatabasePagesExtractor extends AbstractExtractor {
  protected doExtract(xiv: XivDataService): void {
    const spots = this.requireLazyFileByKey('fishingSpots');
    const maps = this.requireLazyFileByKey('mapEntries');
    const names = this.getExtendedNames<LazyPlace>('places');
    const pages = {};
    spots.forEach(spot => {
      const name = this.findZoneName(names, spot.zoneId, spot.mapId);
      if (name === undefined) {
        return null;
      }
      const map = maps.find(m => m.id === spot.mapId);
      pages[spot.id] = {
        ...name,
        ...spot,
        weatherRate: map?.weatherRate,
        patch: this.findPatch('placename', spot.zoneId),
        categoryLabel: ['Unknown', 'Saltwater', 'Freshwater', 'Dune', 'Sky', 'Clouds', 'Magma', 'Aetherochemical pool', 'Salt Lake', 'Space'][spot.category]
      };
    });
    this.persistToMinifiedJsonAsset('db/fishing-spots-database-pages', pages);
    this.done();
  }

  getName(): string {
    return 'fishing-spots-db-pages';
  }

}
