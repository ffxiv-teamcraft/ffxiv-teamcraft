import { XivDataService } from '../xiv/xiv-data.service';
import { AbstractExtractor } from '../abstract-extractor';

export class CollectablesShopsExtractor extends AbstractExtractor {
  protected doExtract(xiv: XivDataService): any {
    const collectablesShops = {};
    this.getSheet(xiv, 'CollectablesShop').subscribe(collectablesShopCompleteFetch => {
      collectablesShopCompleteFetch.forEach(entry => {
        // Skip the revenant's toll NPC, only accepts old stuff that we don't want to list
        if (entry.index === 3866627) {
          return;
        }
        for (let i = 0; i < 11; i++) {
          if (entry.ShopItems[i] === 0) {
            continue;
          }
          collectablesShops[i] = [
            ...(collectablesShops[i] || []),
            entry.ShopItems[i]
          ];
        }
      });

      this.persistToJsonAsset('collectables-shops', collectablesShops);
      this.done();
    });
  }

  getName(): string {
    return 'collectables-shops';
  }

}
