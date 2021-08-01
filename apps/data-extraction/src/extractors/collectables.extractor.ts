import { combineLatest } from 'rxjs';
import { AbstractExtractor } from '../abstract-extractor';

export class CollectablesExtractor extends AbstractExtractor {
  protected doExtract(): any {
    const currencies = {
      '1': 10309,
      '2': 17833,
      '3': 10311,
      '4': 17834,
      '5': 10307,
      '6': 25199,
      '7': 25200,
      '8': 21072,
      '9': 21073,
      '10': 21074,
      '11': 21075,
      '12': 21076,
      '13': 21077,
      '14': 21078,
      '15': 21079,
      '16': 21080,
      '17': 21081,
      '18': 21172,
      '19': 21173,
      '20': 21935,
      '21': 22525,
      '22': 26533,
      '23': 26807,
      '24': 28063,
      '25': 28186,
      '26': 28187,
      '27': 28188,
      '28': 30341
    };

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
    combineLatest([
      this.getAllEntries('https://xivapi.com/HWDCrafterSupply'),
      this.getAllEntries('https://xivapi.com/CollectablesShop'),
      this.aggregateAllPages('https://xivapi.com/CollectablesShopRewardItem?columns=ID,CollectablesShopRefine,CollectablesShopRewardScrip,ItemTargetID,Item.IsCollectable,LevelMin,LevelMax,CollectablesShopItemGroupTargetID')
    ])
      .subscribe(([hwdCompleteFetch, shopsCompleteFetch, collectableRewardsCompleteFetch]) => {
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
        shopsCompleteFetch
          .forEach(shop => {
            [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].forEach(i => {
              (shop[`ShopItems${i}`] || []).forEach(collectable => {
                let reward = currencies[collectable.CollectablesShopRewardScrip.Currency];
                if (shop.RewardType === 2) {
                  reward = collectableRewardsCompleteFetch.find(cReward => {
                    return cReward.ID === collectable.CollectablesShopRewardScripTargetID;
                  });
                }
                collectables[collectable.ItemTargetID] = {
                  collectable: collectable.Item.AlwaysCollectable,
                  level: collectable.LevelMin,
                  levelMin: collectable.LevelMin,
                  levelMax: collectable.LevelMax,
                  group: collectable.CollectablesShopItemGroupTargetID,
                  shopId: +collectable.ID.split('.')[0],
                  reward,
                  base: {
                    rating: collectable.CollectablesShopRefine.LowCollectability,
                    exp: collectable.CollectablesShopRewardScrip.ExpRatioLow,
                    scrip: collectable.CollectablesShopRewardScrip.LowReward
                  },
                  mid: {
                    rating: collectable.CollectablesShopRefine.MidCollectability,
                    exp: collectable.CollectablesShopRewardScrip.ExpRatioMid,
                    scrip: collectable.CollectablesShopRewardScrip.MidReward
                  },
                  high: {
                    rating: collectable.CollectablesShopRefine.HighCollectability,
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
        this.done();
      });
  }

  getName(): string {
    return 'collectables';
  }

}
