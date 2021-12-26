import { combineLatest } from 'rxjs';
import { AbstractExtractor } from '../abstract-extractor';
import { StaticData } from '../static-data';

export class CollectablesExtractor extends AbstractExtractor {
  protected doExtract(): any {
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
      this.getAllEntries('https://xivapi.com/HWDCrafterSupply'),
      this.getAllEntries('https://xivapi.com/CollectablesShop'),
      this.aggregateAllPages('https://xivapi.com/CollectablesShopItem?columns=ID,CollectablesShopRefine,CollectablesShopRewardScrip,ItemTargetID,Item.AlwaysCollectable,Item.IsCollectable,LevelMin,LevelMax,CollectablesShopItemGroupTargetID'),
      this.aggregateAllPages('https://xivapi.com/CollectablesShopRewardItem?columns=ID,CollectablesShopRefine,CollectablesShopRewardScrip,ItemTargetID,Item.AlwaysCollectable,Item.IsCollectable,LevelMin,LevelMax,CollectablesShopItemGroupTargetID')
    ])
      .subscribe(([hwdCompleteFetch, shopsCompleteFetch, collectablesCompleteFetch, collectableRewardsCompleteFetch]) => {
        // HWD supplies
        hwdCompleteFetch.forEach(supply => {
          for (let i = 0; i < 32; i++) {
            if (!supply[`ItemTradeIn${i}TargetID`]) {
              continue;
            }
            const baseReward = supply[`BaseCollectableReward${i}`];
            collectables[supply[`ItemTradeIn${i}TargetID`]] = {
              hwd: true,
              level: supply[`Level${i}`],
              reward: 28063,
              base: {
                rating: supply[`BaseCollectableRating${i}`],
                exp: baseReward ? baseReward.ExpReward : 0,
                scrip: baseReward ? baseReward.ScriptRewardAmount : 0
              },
              mid: {
                rating: supply[`MidCollectableRating${i}`],
                exp: supply[`MidCollectableReward${i}`].ExpReward,
                scrip: supply[`MidCollectableReward${i}`].ScriptRewardAmount
              },
              high: {
                rating: supply[`HighCollectableRating${i}`],
                exp: supply[`HighCollectableReward${i}`].ExpReward,
                scrip: supply[`HighCollectableReward${i}`].ScriptRewardAmount
              }
            };
          }
        });

        // Collectables shops
        collectablesCompleteFetch
          .filter(collectable => {
            return collectable.CollectablesShopRewardScrip !== null;
          })
          .forEach(collectable => {
            scripIndex[collectable.ItemTargetID] = StaticData.CURRENCIES[collectable.CollectablesShopRewardScrip.Currency];
            const [lowThreshold, midThreshold, highThreshold] = [
              collectable.CollectablesShopRefine.LowCollectability,
              collectable.CollectablesShopRefine.MidCollectability,
              collectable.CollectablesShopRefine.HighCollectability
            ].sort((a, b) => a - b);
            collectables[collectable.ItemTargetID] = {
              collectable: collectable.Item.AlwaysCollectable | collectable.Item.IsCollectable,
              level: collectable.LevelMin,
              levelMin: collectable.LevelMin,
              levelMax: collectable.LevelMax,
              group: collectable.CollectablesShopItemGroupTargetID,
              shopId: +collectable.ID.split('.')[0],
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
            if (+collectable.ID < 10) {
              collectables[collectable.ItemTargetID] = {
                ...collectables[collectable.ItemTargetID],
                hwd: true,
                reward: hwdRewards[collectable.ID]
              };
            }
          });

        // Collectables trades
        shopsCompleteFetch
          .forEach(shop => {
            [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].forEach(i => {
              (shop[`ShopItems${i}`] || []).forEach(collectable => {
                if (!collectable.CollectablesShopRewardScrip) {
                  return;
                }
                let reward = StaticData.CURRENCIES[collectable.CollectablesShopRewardScrip.Currency];
                if (shop.RewardType === 2) {
                  reward = collectableRewardsCompleteFetch.find(cReward => {
                    return cReward.ID === collectable.CollectablesShopRewardScripTargetID;
                  })?.ItemTargetID;
                }
                const [lowThreshold, midThreshold, highThreshold] = [
                  collectable.CollectablesShopRefine.LowCollectability,
                  collectable.CollectablesShopRefine.MidCollectability,
                  collectable.CollectablesShopRefine.HighCollectability
                ].sort((a, b) => a - b);
                collectables[collectable.ItemTargetID] = {
                  collectable: collectable.Item.AlwaysCollectable | collectable.Item.IsCollectable,
                  level: collectable.LevelMin,
                  levelMin: collectable.LevelMin,
                  levelMax: collectable.LevelMax,
                  group: collectable.CollectablesShopItemGroupTargetID,
                  shopId: +collectable.ID.split('.')[0],
                  reward,
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
                if (+collectable.ID < 10) {
                  collectables[collectable.ItemTargetID] = {
                    ...collectables[collectable.ItemTargetID],
                    hwd: true,
                    reward: hwdRewards[collectable.ID]
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
