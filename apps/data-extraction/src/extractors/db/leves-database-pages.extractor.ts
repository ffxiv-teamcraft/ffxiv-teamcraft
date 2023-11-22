import { AbstractExtractor } from '../../abstract-extractor';
import { XivDataService } from '../../xiv/xiv-data.service';
import { makeIcon } from '../../xiv/make-icon';
import { levemetes } from '@ffxiv-teamcraft/data/handmade/levemetes';

export class LevesDatabasePagesExtractor extends AbstractExtractor {
  protected doExtract(xiv: XivDataService): void {
    const eventItems = this.getExtendedNames('eventItems')
      .reduce((acc, item) => {
        return {
          ...acc,
          [item.id]: item
        };
      }, {});
    this.getSheet(xiv, 'Leve',
      [
        'Name', 'Description', 'IconIssuer', 'JournalGenre#',
        'LevelLevemete.Object#', 'LeveRewardItem', 'AllowanceCost',
        'ClassJobLevel', 'ExpReward', 'GilReward',
        'DataId.Item#', 'DataId.ItemCount#', 'DataId.Repeats#',
        'DataId.LeveData*', 'DataId.BNpcName#', 'DataId.EnemyLevel'
      ],
      false, 2).subscribe(leves => {
      const pages = {};
      this.extendNames(leves, [
        {
          field: 'Name',
          koSource: 'koLeves',
          zhSource: 'zhLeves'
        },
        {
          field: 'Description',
          koSource: 'koLeveDescriptions',
          zhSource: 'zhLeveDescriptions',
          targetField: 'description'
        }
      ]).forEach(({ row, extended }) => {
        const npcs = [];
        if (row.LevelLevemete) {
          npcs.push({
            id: row.LevelLevemete.Object,
            client: true,
            issuer: false
          });
        }
        const levemete = Object.keys(levemetes).find(key => levemetes[key].includes(row.index));
        if (levemete !== undefined) {
          npcs.push({
            id: +levemete,
            issuer: true,
            client: false
          });
        }
        const rewards = row.LeveRewardItemGroup
          ?.filter(group => group.index > 0)
          .map((group, i) => {
            const probability = row.LeveRewardItemGroup['Probability%'][i];
            return group.Item
              .filter(id => id > 0)
              .map((id, itemIndex, array) => {
                return {
                  id,
                  amount: group.Count[itemIndex],
                  hq: group.HQ[itemIndex],
                  chances: Math.floor(probability / array.length)
                };
              });
          })
          .flat() || [];

        pages[row.index] = {
          id: row.index,
          icon: makeIcon(row.IconIssuer),
          ...extended,
          npcs: npcs.reverse(),
          genre: row.JournalGenre,
          cost: row.AllowanceCost,
          level: row.ClassJobLevel,
          exp: row.ExpReward,
          gil: row.GilReward,
          repeats: row.DataId.Repeats || 0,
          rewards
        };

        if (row.DataId.__sheet === 'CraftLeve') {
          pages[row.index].items = row.DataId.Item.filter(Boolean).map((item, index) => {
            return {
              id: item,
              amount: row.DataId.ItemCount[index]
            };
          });
        }

        if (row.DataId.__sheet === 'BattleLeve') {
          pages[row.index].battleItems = row.DataId.LeveData
            .filter(data => data.ItemsInvolved)
            .map((data) => {
              return {
                id: data.ItemsInvolved.index,
                name: eventItems[data.ItemsInvolved.index],
                icon: eventItems[data.ItemsInvolved.index]?.icon,
                amount: data.ItemsInvolvedQty,
                dropRate: data.ItemDropRate
              };
            });
          pages[row.index].enemies = row.DataId.LeveData
            .filter(data => data.BNpcName.index)
            .map((data) => {
              return {
                id: data.BNpcName.index,
                level: data.EnemyLevel
              };
            });
        }
      });

      this.persistToMinifiedJsonAsset('db/leves-database-pages', pages);
      this.done();
    });
  }

  getName(): string {
    return 'leves-db-pages';
  }

}
