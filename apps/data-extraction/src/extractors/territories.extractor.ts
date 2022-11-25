import { AbstractExtractor } from '../abstract-extractor';
import { XivDataService } from '../xiv/xiv-data.service';

export class TerritoriesExtractor extends AbstractExtractor {
  protected doExtract(xiv: XivDataService): any {
    const territories = {};
    this.getSheet(xiv, 'TerritoryType', ['Map']).subscribe(res => {
      res.forEach(territory => {
        territories[territory.index] = territory.Map;
      });
      this.persistToTypescript('territories', 'territories', territories);
      this.done();
    });
  }

  getName(): string {
    return 'territories';
  }

}
