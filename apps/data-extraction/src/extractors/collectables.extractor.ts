import { combineLatest } from 'rxjs';
import { XivDataService } from '../xiv/xiv-data.service';
import { AbstractExtractor } from '../abstract-extractor';
import { StaticData } from '../static-data';

export class CollectablesExtractor extends AbstractExtractor {
  protected doExtract(xiv: XivDataService): any {
    const hwdRewards = {
      '1.0': 30315,
      '1.1': 30316,
      '2.0': 30317,
      '2.1': 30318,
      '3.0': 30319,
      '3.1': 30320,
      '4.0': 30321,
      '4.1': 30322,
      '5.0': 30323,
      '5.1': 30324,
      '6.0': 30325,
      '6.1': 30326,
      '7.0': 30327,
      '7.1': 30328,
      '8.0': 30329,
      '8.1': 30330,
      // After this line, they don't exist for now, just assuming new values, will update after next patch
      '1.2': 31736,
      '2.2': 31737,
      '3.2': 31738,
      '4.2': 31739,
      '5.2': 31740,
      '6.2': 31741,
      '7.2': 31742,
      '8.2': 31743,
      '1.3': 31746,
      '2.3': 31744,
      '3.3': 31748,
      '4.3': 31749
    };
    const collectables = {};
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
      this.getSheet<any>(xiv, 'CollectablesShopItem',
        [
          'CollectablesShopRefine',
          'CollectablesShopRewardScrip',
          'Item.AlwaysCollectable', 'Item.IsCollectable', 'LevelMin', 'LevelMax', 'CollectablesShopItemGroup#'
        ], false, 2),
      this.getSheet<any>(xiv, 'CollectablesShopRewardItem', ['CollectablesShopRefine#', 'CollectablesShopRewardScrip#', 'Item.AlwaysCollectable', 'Item.IsCollectable', 'LevelMin', 'LevelMax', 'CollectablesShopItemGroup#'], false, 1)
    ])
      .subscribe(([hwdCompleteFetch, shopsCompleteFetch, collectablesCompleteFetch, collectableRewardsCompleteFetch]) => {
        // HWDCrafterSupply
        hwdCompleteFetch.forEach(supply => {
          for (let i = 0; i < 32; i++) {
            if (!supply.ItemTradeIn[i]) {
              continue;
            }
            const baseReward = supply.BaseCollectableReward[i];
            collectables[supply.ItemTradeIn[i]] = {
              hwd: true,
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

        // CollectablesShopItem
        collectablesCompleteFetch
          .filter(collectable => {
            return collectable.CollectablesShopRewardScrip?.index > 0;
          })
          .forEach(collectable => {
            scripIndex[collectable.Item.index] = StaticData.CURRENCIES[collectable.CollectablesShopRewardScrip.Currency];
            const [lowThreshold, midThreshold, highThreshold] = [
              collectable.CollectablesShopRefine.LowCollectability,
              collectable.CollectablesShopRefine.MidCollectability,
              collectable.CollectablesShopRefine.HighCollectability
            ].sort((a, b) => a - b);
            if (highThreshold === 0) {
              return;
            }
            collectables[collectable.Item.index] = {
              collectable: collectable.Item.AlwaysCollectable | collectable.Item.IsCollectable,
              level: collectable.LevelMin,
              levelMin: collectable.LevelMin,
              levelMax: collectable.LevelMax,
              group: collectable.CollectablesShopItemGroup,
              shopId: collectable.index,
              reward: StaticData.CURRENCIES[collectable.CollectablesShopRewardScrip.Currency],
              base: {
                rating: lowThreshold,
                exp: collectable.CollectablesShopRewardScrip.ExpRatioLow,
                scrip: collectable.CollectablesShopRewardScrip.LowReward
              },
              mid: {
                rating: midThreshold,
                exp: collectable.CollectablesShopRewardScrip.ExpRatioMid,
                scrip: collectable.CollectablesShopRewardScrip.MidReward
              },
              high: {
                rating: highThreshold,
                exp: collectable.CollectablesShopRewardScrip.ExpRatioHigh,
                scrip: collectable.CollectablesShopRewardScrip.HighReward
              }
            };
            if (+collectable.index < 10) {
              collectables[collectable.Item.index] = {
                ...collectables[collectable.Item.index],
                hwd: true,
                reward: hwdRewards[this.getCompositeID(collectable)]
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
                const [lowThreshold, midThreshold, highThreshold] = [
                  collectable.CollectablesShopRefine.LowCollectability,
                  collectable.CollectablesShopRefine.MidCollectability,
                  collectable.CollectablesShopRefine.HighCollectability
                ].sort((a, b) => a - b);
                if (highThreshold === 0) {
                  return;
                }
                let rewardId = StaticData.CURRENCIES[collectable.CollectablesShopRewardScrip.Currency];
                if (shop.RewardType === 2) {
                  rewardId = collectableRewardsCompleteFetch.find(cReward => {
                    return cReward.index === collectable.CollectablesShopRewardScrip?.index;
                  })?.Item?.index;
                }
                collectables[collectable.Item.index] = {
                  collectable: collectable.Item.AlwaysCollectable | collectable.Item.IsCollectable,
                  level: collectable.LevelMin,
                  levelMin: collectable.LevelMin,
                  levelMax: collectable.LevelMax,
                  group: collectable.CollectablesShopItemGroup,
                  shopId: collectable.index,
                  reward: rewardId,
                  base: {
                    rating: lowThreshold,
                    exp: collectable.CollectablesShopRewardScrip.ExpRatioLow,
                    scrip: collectable.CollectablesShopRewardScrip.LowReward
                  },
                  mid: {
                    rating: midThreshold,
                    exp: collectable.CollectablesShopRewardScrip.ExpRatioMid,
                    scrip: collectable.CollectablesShopRewardScrip.MidReward
                  },
                  high: {
                    rating: highThreshold,
                    exp: collectable.CollectablesShopRewardScrip.ExpRatioHigh,
                    scrip: collectable.CollectablesShopRewardScrip.HighReward
                  }
                };
                if (+collectable.index < 10) {
                  collectables[collectable.Item.index] = {
                    ...collectables[collectable.Item.index],
                    hwd: true,
                    reward: hwdRewards[this.getCompositeID(collectable)]
                  };
                }
              });
            });
          });
        this.persistToJsonAsset('collectables', collectables);
        this.persistToJsonAsset('scrip-index', scripIndex);
        this.done();
      });
  }

  getName(): string {
    return 'collectables';
  }

}
