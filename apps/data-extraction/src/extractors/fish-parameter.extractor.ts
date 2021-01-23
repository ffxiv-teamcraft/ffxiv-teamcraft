import { AbstractExtractor } from '../abstract-extractor';

export class FishParameterExtractor extends AbstractExtractor {
  protected doExtract(): any {
    const bigFishes = {};

    this.getAllPages('https://xivapi.com/FishParameter?columns=ID,IsHidden,Item').subscribe(res => {
      res.Results.forEach(fish => {
        if (fish.IsHidden) {
          bigFishes[fish.Item.ID] = 1;
        }
      });
    }, null, () => {
      this.persistToJsonAsset('big-fishes', bigFishes);
      this.done();
    });
  }

  getName(): string {
    return 'fish-parameter';
  }

}
