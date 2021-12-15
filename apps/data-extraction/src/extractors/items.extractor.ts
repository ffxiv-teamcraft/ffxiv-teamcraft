import { AbstractExtractor } from '../abstract-extractor';

export class ItemsExtractor extends AbstractExtractor {
  getSlotName(equipSlotCategoryId: number): string {
    return [
      '1HWpn%',
      'OH%',
      'Head%',
      'Chest%',
      'Hands%',
      'Waist%',
      'Legs%',
      'Feet%',
      'Earring%',
      'Necklace%',
      'Bracelet%',
      'Ring%',
      '2HWpn%',
      '1HWpn%',
      'ChestHead%',
      'ChestHeadLegsFeet%',
      '',
      'LegsFeet%',
      'HeadChestHandsLegsFeet%',
      'ChestLegsGloves%',
      'ChestLegsFeet%',
      ''
    ][equipSlotCategoryId - 1];
  };

  protected doExtract(): any {

    const names = {};
    const rarities = {};
    const itemIcons = {};
    const ilvls = {};
    const stackSizes = {};
    const equipment = {};
    const itemStats = {};
    const itemMainAttributes = {};
    const itemMeldingData = {};
    const hqFlags = {};
    const tradeFlags = {};
    const equipSlotCategoryId = {};
    const itemPatch = {};
    const itemSetBonuses = {};
    const marketItems = [];
    const baitItems = [];
    const extractableItems = {};
    const baseParamSpecialColumns = [].concat.apply([], ['BaseParamSpecial', 'BaseParamValueSpecial'].map(prop => [0, 1, 2, 3, 4, 5].map(i => `${prop}${i}`))).join(',');
    this.getAllPages(`https://xivapi.com/Item?columns=Patch,DamagePhys,DamageMag,DefensePhys,DefenseMag,ID,Name_*,IsUnique,IsUntradable,MaterializeType,CanBeHq,Rarity,GameContentLinks,Icon,IconHD,LevelItem,LevelEquip,StackSize,EquipSlotCategoryTargetID,ClassJobCategory,Stats,MateriaSlotCount,BaseParamModifier,IsAdvancedMeldingPermitted,ItemSearchCategoryTargetID,ItemSeries,${baseParamSpecialColumns}`)
      .subscribe(page => {
        page.Results.forEach(item => {
          itemIcons[item.ID] = item.IconHD || item.Icon;
          names[item.ID] = {
            en: item.Name_en,
            de: item.Name_de,
            ja: item.Name_ja,
            fr: item.Name_fr
          };
          rarities[item.ID] = item.Rarity;
          ilvls[item.ID] = item.LevelItem;
          stackSizes[item.ID] = item.StackSize;
          itemPatch[item.ID] = item.Patch;
          if (item.CanBeHq) {
            hqFlags[item.ID] = 1;
          }
          if (item.IsUntradable === 0) {
            tradeFlags[item.ID] = 1;
          }
          if (item.ItemSearchCategoryTargetID >= 9) {
            marketItems.push(item.ID);
          }
          if ([30, 46].includes(item.ItemSearchCategoryTargetID)) {
            baitItems.push(item.ID);
          }
          if (item.MaterializeType > 0) {
            extractableItems[item.ID] = 1;
          }
          if (item.Stats) {
            itemStats[item.ID] = Object.values(item.Stats);
            itemMainAttributes[item.ID] = [];
            if (item.DamagePhys || item.DamageMag) {
              if (item.DamagePhys > item.DamageMag) {
                itemMainAttributes[item.ID].push(
                  {
                    ID: 12,
                    NQ: item.DamagePhys,
                    HQ: item.DamagePhys + (+item.BaseParamValueSpecial0)
                  });
              } else {
                itemMainAttributes[item.ID].push(
                  {
                    ID: 13,
                    NQ: item.DamageMag,
                    HQ: item.DamageMag + (+item.BaseParamValueSpecial1)
                  });
              }
            }
            if (item.DefensePhys || item.DefenseMag) {
              itemMainAttributes[item.ID].push({
                  ID: 21,
                  NQ: item.DefensePhys,
                  HQ: item.DefensePhys + (+item.BaseParamValueSpecial0)
                },
                {
                  ID: 24,
                  NQ: item.DefenseMag,
                  HQ: item.DefenseMag + (+item.BaseParamValueSpecial1)
                });
            }
            if (itemMainAttributes[item.ID].length === 0) {
              delete itemMainAttributes[item.ID];
            }
          }
          if (item.ItemSeries) {
            itemSetBonuses[item.ID] = {
              itemSeriesId: item.ItemSeries.ID,
              bonuses: [0, 1, 2, 3, 4, 5]
                .filter(i => item[`BaseParamSpecial${i}`] !== null)
                .map(i => {
                  return {
                    baseParam: item[`BaseParamSpecial${i}`].ID,
                    value: item[`BaseParamValueSpecial${i}`],
                    amountRequired: i + 2
                  };
                })
            };
          }
          if (item.EquipSlotCategoryTargetID && !item.Name_en.startsWith('Dated ')) {
            equipSlotCategoryId[item.ID] = item.EquipSlotCategoryTargetID;
            if (item.Stats) {
              equipment[item.ID] = {
                equipSlotCategory: item.EquipSlotCategoryTargetID,
                level: item.LevelEquip,
                unique: item.IsUnique,
                jobs: Object.keys(item.ClassJobCategory).filter(jobAbbr => item.ClassJobCategory[jobAbbr] === 1)
              };
            }
            itemMeldingData[item.ID] = {
              modifier: item.BaseParamModifier,
              prop: this.getSlotName(item.EquipSlotCategoryTargetID),
              slots: item.MateriaSlotCount,
              overmeld: item.IsAdvancedMeldingPermitted === 1
            };
          }
        });
      }, null, () => {
        this.persistToJsonAsset('item-icons', itemIcons);
        this.persistToJsonAsset('items', names);
        this.persistToJsonAsset('rarities', rarities);
        this.persistToJsonAsset('ilvls', ilvls);
        this.persistToJsonAsset('stack-sizes', stackSizes);
        this.persistToJsonAsset('equipment', equipment);
        this.persistToJsonAsset('item-stats', itemStats);
        this.persistToJsonAsset('item-main-attributes', itemMainAttributes);
        this.persistToJsonAsset('item-melding-data', itemMeldingData);
        this.persistToJsonAsset('hq-flags', hqFlags);
        this.persistToTypescript('sync-hq-flags', 'syncHqFlags', hqFlags);
        this.persistToJsonAsset('trade-flags', tradeFlags);
        this.persistToJsonAsset('item-equip-slot-category', equipSlotCategoryId);
        this.persistToJsonAsset('item-patch', itemPatch);
        this.persistToJsonAsset('market-items', marketItems);
        this.persistToJsonAsset('bait-items', baitItems);
        this.persistToJsonAsset('extractable-items', extractableItems);
        this.persistToJsonAsset('item-set-bonuses', itemSetBonuses);
        this.done();
      });
  }

  getName(): string {
    return 'items';
  }

}
