import { AbstractExtractor } from '../abstract-extractor';
import { XivDataService } from '../xiv/xiv-data.service';

export class WorldsExtractor extends AbstractExtractor {
  protected doExtract(xiv: XivDataService): any {
    this.getSheet(xiv, 'World', ['Name']).subscribe(xivWorlds => {
      const worlds = {};
      xivWorlds.forEach(world => {
        worlds[world.Name.toString().toLowerCase()] = world.index;
      });
      this.persistToTypescript('worlds', 'worlds', worlds);
      this.done();
    });
  }

  getName(): string {
    return 'worlds';
  }

}
