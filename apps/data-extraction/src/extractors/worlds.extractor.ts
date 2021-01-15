import { AbstractExtractor } from '../abstract-extractor';

export class WorldsExtractor extends AbstractExtractor {
  protected doExtract(): any {
    const worlds = {};
    this.getAllPages('https://xivapi.com/World?columns=ID,Name').subscribe(page => {
      page.Results.forEach(world => {
        worlds[world.Name.toLowerCase()] = world.ID;
      });
    }, null, () => {
      this.persistToTypescript('worlds', 'worlds', worlds);
      this.done();
    });
  }

  getName(): string {
    return 'worlds';
  }

}
