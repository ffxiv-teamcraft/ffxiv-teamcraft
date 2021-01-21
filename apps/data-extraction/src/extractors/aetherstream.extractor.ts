import { AbstractExtractor } from '../abstract-extractor';

export class AetherstreamExtractor extends AbstractExtractor {
  protected doExtract(): any {
    const aetherstream = {};
    this.getAllPages('https://xivapi.com/Aetheryte?columns=ID,AetherstreamX,AetherstreamY').subscribe(page => {
      page.Results.forEach(row => {
        aetherstream[row.ID] = { x: row.AetherstreamX, y: row.AetherstreamY };
      });
    }, null, () => {
      this.persistToTypescript('aetherstream', 'aetherstream', aetherstream);
      this.done();
    });
  }

  getName(): string {
    return 'aetherstream';
  }

}
