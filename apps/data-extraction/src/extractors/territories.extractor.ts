import { AbstractExtractor } from '../abstract-extractor';

export class TerritoriesExtractor extends AbstractExtractor {
  protected doExtract(): any {
    const territories = {};
    this.getAllPages('https://xivapi.com/TerritoryType?columns=ID,MapTargetID').subscribe(page => {
      page.Results.forEach(territory => {
        territories[territory.ID] = territory.MapTargetID;
      });
    }, null, () => {
      this.persistToTypescript('territories', 'territories', territories);
      this.done();
    });
  }

  getName(): string {
    return 'territories';
  }

}
