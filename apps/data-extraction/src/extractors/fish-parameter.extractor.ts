import { XivDataService } from '../xiv/xiv-data.service';
import { AbstractExtractor } from '../abstract-extractor';

export class FishParameterExtractor extends AbstractExtractor {
  protected doExtract(xiv: XivDataService): any {
    const legendaryFishIndex = {};

    this.getSheet<any>(xiv, 'FishParameter', ['Item.Description'], true, 1).subscribe(entries => {
      entries.forEach(fish => {
        if (fish.Item?.Description_ja?.includes('オオヌシ')) {
          legendaryFishIndex[fish.Item.index] = 1;
        }
      });
      this.persistToJsonAsset('legendary-fish', legendaryFishIndex);
      this.done();
    });
  }

  getName(): string {
    return 'fish-parameter';
  }

}
