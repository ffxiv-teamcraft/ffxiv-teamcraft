import { AbstractExtractor } from '../abstract-extractor';

export class FishParameterExtractor extends AbstractExtractor {
  protected doExtract(): any {
    const legendaryFishIndex = {};

    this.getAllPages('https://xivapi.com/FishParameter?columns=ID,IsHidden,Item.Description_ja,Item.ID').subscribe(res => {
      res.Results.forEach(fish => {
        if (fish.Item?.Description_ja?.includes('オオヌシ')) {
          legendaryFishIndex[fish.Item.ID] = 1;
        }
      });
    }, null, () => {
      this.persistToJsonAsset('legendary-fish', legendaryFishIndex);
      this.done();
    });
  }

  getName(): string {
    return 'fish-parameter';
  }

}
