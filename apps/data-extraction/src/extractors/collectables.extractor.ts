import { combineLatest } from 'rxjs';
import { XivDataService } from '../xiv/xiv-data.service';
import { AbstractExtractor } from '../abstract-extractor';
import { StaticData } from '../static-data';

export class CollectablesExtractor extends AbstractExtractor {
  protected doExtract(xiv: XivDataService): any {
    const collectables = {};
    const satisfactionThresholds = {};
    const scripIndex = {};
    combineLatest([
      this.getSheet<any>(xiv, 'HWDCrafterSupply',
        ['ItemTradeIn#', 'BaseCollectableReward', 'MidCollectableReward', 'HighCollectableReward', 'BaseCollectableRating', 'MidCollectableRating', 'HighCollectableRating', 'Level#']
        , false, 1),
      this.getSheet<any>(xiv, 'CollectablesShop',
        [
          'ShopItems.CollectablesShopRefine', 'RewardType',
          'ShopItems.CollectablesShopRewardScrip',
          'ShopItems.Item.AlwaysCollectable', 'ShopItems.Item.IsCollectable', 'ShopItems.LevelMin', 'ShopItems.LevelMax', 'ShopItems.CollectablesShopItemGroup#'
        ], false, 3),
      this.getSheet<any>(xiv, 'CollectablesShopRewardItem', ['CollectablesShopRefine#', 'CollectablesShopRewardScrip#', 'Item.AlwaysCollectable',
        'Item.IsCollectable', 'LevelMin', 'LevelMax', 'CollectablesShopItemGroup#', 'RewardLow', 'RewardMid', 'RewardHigh'
      ], false, 1),
      this.getSheet<any>(xiv, 'SatisfactionSupply', [
        'Item#', 'CollectabilityLow', 'CollectabilityMid', 'CollectabilityHigh'
      ], false, 1)
    ])
      .subscribe(([hwdCompleteFetch, shopsCompleteFetch, collectableRewardsCompleteFetch, satisfaction]) => {
        satisfaction.forEach(row => {
          satisfactionThresholds[row.Item] = [
            row.CollectabilityLow * 10,
            row.CollectabilityMid * 10,
            row.CollectabilityHigh * 10
          ];
        });
        // HWDCrafterSupply
        hwdCompleteFetch.forEach(supply => {
          for (let i = 0; i < 32; i++) {
            if (!supply.ItemTradeIn[i]) {
              continue;
            }
            const baseReward = supply.BaseCollectableReward[i];
            collectables[supply.ItemTradeIn[i]] = {
              hwd: true,
              id: supply.index,
              type: 'HWDCrafterSupply',
              level: supply.Level[i],
              reward: 28063,
              base: {
                rating: supply.BaseCollectableRating[i],
                exp: baseReward ? baseReward.ExpReward : 0,
                scrip: baseReward ? baseReward.ScriptRewardAmount : 0
              },
              mid: {
                rating: supply.MidCollectableRating[i],
                exp: supply.MidCollectableReward[i].ExpReward,
                scrip: supply.MidCollectableReward[i].ScriptRewardAmount
              },
              high: {
                rating: supply.HighCollectableRating[i],
                exp: supply.HighCollectableReward[i].ExpReward,
                scrip: supply.HighCollectableReward[i].ScriptRewardAmount
              }
            };
          }
        });

        // CollectablesShop & CollectablesShopRewardItem
        shopsCompleteFetch
          .forEach(shop => {
            shop.ShopItems.forEach(shopItem => {
              shopItem.forEach(collectable => {
                if (!collectable.CollectablesShopRewardScrip) {
                  return;
                }
                if (collectable.CollectablesShopRefine.LowCollectability === 0) {
                  // Skip entries that have no low collectability as they are probably bogus.
                  return;
                }
                scripIndex[collectable.Item.index] = StaticData.CURRENCIES[collectable.CollectablesShopRewardScrip.Currency];
                let rewardId = StaticData.CURRENCIES[collectable.CollectablesShopRewardScrip.Currency];
                let rewardLow = collectable.CollectablesShopRewardScrip.LowReward;
                let rewardMid = collectable.CollectablesShopRewardScrip.MidReward;
                let rewardHigh = collectable.CollectablesShopRewardScrip.HighReward;
                if (shop.RewardType === 2) {
                  // Collectable trades reward you with items, for example material for
                  // the crafting relics.
                  // The rewards are stored in another table also indicating how many items
                  // you obtain for each collectability threshold.
                  const rewardEntry = collectableRewardsCompleteFetch.find(cReward => {
                    return cReward.index === collectable.CollectablesShopRewardScrip?.index;
                  });
                  rewardId = rewardEntry?.Item?.index;
                  rewardLow = rewardEntry.RewardLow;
                  rewardMid = rewardEntry.RewardMid;
                  rewardHigh = rewardEntry.RewardHigh;
                }
                collectables[collectable.Item.index] = {
                  id: collectable.index,
                  type: 'CollectablesShopItem',
                  rewardType: shop.RewardType,
                  collectable: collectable.Item.AlwaysCollectable | collectable.Item.IsCollectable,
                  level: collectable.LevelMin,
                  levelMin: collectable.LevelMin,
                  levelMax: collectable.LevelMax,
                  group: collectable.CollectablesShopItemGroup,
                  shopId: collectable.index,
                  reward: rewardId,
                  base: {
                    quantity: 1,
                    rating: collectable.CollectablesShopRefine.LowCollectability,
                    exp: collectable.CollectablesShopRewardScrip.ExpRatioLow,
                    scrip: rewardLow
                  },
                  mid: {
                    quantity: 1,
                    rating: collectable.CollectablesShopRefine.MidCollectability,
                    exp: collectable.CollectablesShopRewardScrip.ExpRatioMid,
                    scrip: rewardMid
                  },
                  high: {
                    quantity: 1,
                    rating: collectable.CollectablesShopRefine.HighCollectability,
                    exp: collectable.CollectablesShopRewardScrip.ExpRatioHigh,
                    scrip: rewardHigh
                  }
                };
              });
            });
          });
        this.persistToJsonAsset('satisfaction-thresholds', satisfactionThresholds);
        this.persistToJsonAsset('collectables', collectables);
        this.persistToJsonAsset('scrip-index', scripIndex);
        this.done();
      });
  }

  getName(): string {
    return 'collectables';
  }

}
