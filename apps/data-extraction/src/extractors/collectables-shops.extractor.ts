import { AbstractExtractor } from '../abstract-extractor';

export class CollectablesShopsExtractor extends AbstractExtractor {
  protected doExtract(): any {
    const collectablesShops = {};
    this.getAllEntries('https://xivapi.com/CollectablesShop').subscribe(collectablesShopCompleteFetch => {
      collectablesShopCompleteFetch.forEach(entry => {
        // Skip the revenant's toll NPC, only accepts old stuff that we don't want to list
        if (entry.ID === 3866627) {
          return;
        }
        for (let i = 0; i < 11; i++) {
          if (entry[`ShopItems${i}TargetID`] === 0) {
            continue;
          }
          collectablesShops[i] = [
            ...(collectablesShops[i] || []),
            entry[`ShopItems${i}TargetID`]
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
