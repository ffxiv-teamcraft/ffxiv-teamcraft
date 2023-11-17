import { AbstractExtractor } from '../abstract-extractor';
import { XivDataService } from '../xiv/xiv-data.service';
import { combineLatest } from 'rxjs';

export class ItemsExtractor extends AbstractExtractor {
  getSlotName(equipSlotCategoryId: number): string {
    return [
      'OneHandWeaponPercent',
      'OffHandPercent',
      'HeadPercent',
      'ChestPercent',
      'HandsPercent',
      'WaistPercent',
      'LegsPercent',
      'FeetPercent',
      'EarringPercent',
      'NecklacePercent',
      'BraceletPercent',
      'RingPercent',
      'TwoHandWeaponPercent',
      'OneHandWeaponPercent',
      'ChestHeadPercent',
      'ChestHeadLegsFeetPercent',
      '',
      'LegsFeetPercent',
      'HeadChestHandsLegsFeetPercent',
      'ChestLegsGlovesPercent',
      'ChestLegsFeetPercent',
      ''
    ][equipSlotCategoryId - 1];
  };

  protected doExtract(xiv: XivDataService): any {

    const names = {};
    const rarities = {};
    const itemIcons = {};
    const ilvls = {};
    const stackSizes = {};
    const equipment = {};
    const itemStats = {};
    const itemBonuses = {};
    const itemMainAttributes = {};
    const itemMeldingData = {};
    const hqFlags = {};
    const tradeFlags = {};
    const equipSlotCategoryId = {};
    const itemPatch = {};
    const additionalItemData = {};
    const itemSetBonuses = {};
    const marketItems = [];
    const baits = [];
    const extractableItems = {};
    const aetherialReduce = {};
    const collectableFlags = {};
    const uiCategories = {};

    combineLatest([
      this.getSheet<any>(xiv, 'Item',
        ['AlwaysCollectable', 'AetherialReduce', 'Patch', 'DamagePhys', 'DamageMag', 'DefensePhys', 'DefenseMag', 'Name', 'Description',
          'IsUnique', 'IsUntradable', 'MaterializeType', 'CanBeHq', 'Rarity', 'Icon', 'LevelItem#', 'LevelEquip', 'StackSize',
          'EquipSlotCategory#', 'ClassJobCategory', 'MateriaSlotCount', 'BaseParamModifier', 'IsAdvancedMeldingPermitted',
          'ItemSearchCategory#', 'ItemSeries#', 'BaseParam#', 'BaseParamValue', 'BaseParamSpecial#', 'BaseParamValueSpecial', 'ItemAction',
          'Delayms', 'ItemUICategory#', 'ClassJobRepair#', 'Desynth'], false, 1),
      this.getNonXivapiUrl('https://raw.githubusercontent.com/xivapi/ffxiv-datamining-patches/master/patchdata/Item.json'),
      this.getSheet(xiv, 'ItemFood', ['Value', 'ValueHQ', 'BaseParam', 'IsRelative', 'Max', 'MaxHQ'])
    ])
      .subscribe(([items, patchData, itemFood]) => {
        items.forEach(item => {
          try {
            itemIcons[item.index] = this.getIconHD(item.Icon);
          } catch (e) {
            console.log(item.index, 'has no Icon?', item);
          }
          names[item.index] = {
            en: item.Name_en,
            de: item.Name_de,
            ja: item.Name_ja,
            fr: item.Name_fr
          };
          additionalItemData[item.index] = {
            repair: item.ClassJobRepair,
            desynth: item.Desynth,
            bpvSpecial: item.BaseParamValueSpecial.filter(Boolean)
          };
          uiCategories[item.index] = item.ItemUICategory;
          rarities[item.index] = item.Rarity;
          ilvls[item.index] = item.LevelItem;
          stackSizes[item.index] = item.StackSize;
          if (item.CanBeHq) {
            hqFlags[item.index] = 1;
          }
          if (item.IsUntradable === false) {
            tradeFlags[item.index] = 1;
          }
          if (item.ItemSearchCategory >= 9) {
            marketItems.push(item.index);
          }
          if ([30].includes(item.ItemSearchCategory)) {
            // -1: Universal
            // 1: Saltwater
            // 2: Freshwater
            // 3: Dune
            // 4: Sky
            // 5: Clouds
            // 6: Magma
            // 7: Aetherochemical pool
            // 8: Salt Lake
            // 9: Space
            const handmadeCategories = {
              28634: [-1],// Metal Spinner
              30136: [-1], // Signature Skyball
              29717: [-1] // Versatile Lure
            };

            const labels = item.Description_en?.toString().match(/(freshwater|ocean|dunefishing|skyfishing|salt lake|cloud|lakeland|sea|saltwater|aetherfishing|starfishing|hellfishing|coast|river)/gm);
            const categoryIndex = {
              'ocean': 1,
              'sea': 1,
              'saltwater': 1,
              'coast': 1,
              'freshwater': 2,
              'lake': 2,
              'land': 2,
              'dunefishing': 3,
              'skyfishing': 4,
              'cloud': 5,
              'hellfishing': 6,
              'salt lake': 6,
              'aetherfishing': 7,
              'starfishing': 9
            };
            let categories = [];
            const hardcoded = handmadeCategories[item.index];
            if (!hardcoded) {
              if (labels && labels.length > 0) {
                categories = labels.map(label => categoryIndex[label]);
              }
            } else {
              categories = hardcoded;
            }
            baits.push({
              id: item.index,
              categories
            });
          }
          if (item.MaterializeType > 0) {
            extractableItems[item.index] = 1;
          }
          if (item.AetherialReduce) {
            aetherialReduce[item.index] = item.AetherialReduce;
          }
          if (item.AlwaysCollectable) {
            collectableFlags[item.index] = 1;
          }
          if ([844, 845, 846].includes(item.ItemAction?.Type)) {
            itemBonuses[item.index] = this.processBonuses(itemFood.find(food => food.index === item.ItemAction.Data[1]));
          }
          if (item.BaseParam.some(p => p > 0)) {
            itemStats[item.index] = this.processStats(item);
            itemMainAttributes[item.index] = [];
            if (item.DamagePhys || item.DamageMag) {
              if (item.DamagePhys > item.DamageMag) {
                itemMainAttributes[item.index].push(
                  {
                    ID: 12,
                    NQ: item.DamagePhys,
                    HQ: Number(item.DamagePhys) + Number(item.BaseParamValueSpecial[0])
                  });
              } else {
                itemMainAttributes[item.index].push(
                  {
                    ID: 13,
                    NQ: item.DamageMag,
                    HQ: Number(item.DamageMag) + Number(item.BaseParamValueSpecial[1])
                  });
              }
            }
            if (item.DefensePhys || item.DefenseMag) {
              itemMainAttributes[item.index].push({
                  ID: 21,
                  NQ: item.DefensePhys,
                  HQ: Number(item.DefensePhys) + Number(item.BaseParamValueSpecial[0])
                },
                {
                  ID: 24,
                  NQ: item.DefenseMag,
                  HQ: Number(item.DefenseMag) + Number(item.BaseParamValueSpecial[1])
                });
            }
            if (itemMainAttributes[item.index].length === 0) {
              delete itemMainAttributes[item.index];
            }
          }
          itemPatch[item.index] = patchData[item.index];
          if (item.ItemSeries > 0) {
            itemSetBonuses[item.index] = {
              itemSeriesId: item.ItemSeries,
              bonuses: [0, 1, 2, 3, 4, 5]
                .filter(i => item.BaseParamSpecial[i] > 0 && item.BaseParamValueSpecial[i] > 0)
                .map(i => {
                  return {
                    baseParam: item.BaseParamSpecial[i],
                    value: item.BaseParamValueSpecial[i],
                    amountRequired: i
                  };
                })
            };
          }
          if (item.EquipSlotCategory && !item.Name_en.toString().startsWith('Dated ')) {
            equipSlotCategoryId[item.index] = item.EquipSlotCategory;
            if (itemStats[item.index]) {
              equipment[item.index] = {
                equipSlotCategory: item.EquipSlotCategory,
                level: item.LevelEquip,
                unique: item.IsUnique ? 1 : 0,
                jobs: Object.keys(item.ClassJobCategory).filter(jobAbbr => item.ClassJobCategory[jobAbbr] === true),
                pDmg: item.DamagePhys,
                mDmg: item.DamageMag,
                pDef: item.DefensePhys,
                mDef: item.DefenseMag,
                delay: item.Delayms
              };
              itemMeldingData[item.index] = {
                modifier: item.BaseParamModifier,
                prop: this.getSlotName(item.EquipSlotCategory),
                slots: item.MateriaSlotCount,
                overmeld: item.IsAdvancedMeldingPermitted
              };
            }
          }
        });
        this.persistToJsonAsset('item-icons', itemIcons);
        this.persistToJsonAsset('items', names);
        this.persistToJsonAsset('rarities', rarities);
        this.persistToJsonAsset('ilvls', ilvls);
        this.persistToJsonAsset('stack-sizes', stackSizes);
        this.persistToJsonAsset('equipment', equipment);
        this.persistToJsonAsset('ui-categories', uiCategories);
        this.persistToJsonAsset('item-main-attributes', itemMainAttributes);
        this.persistToJsonAsset('item-melding-data', itemMeldingData);
        this.persistToJsonAsset('hq-flags', hqFlags);
        this.persistToTypescript('sync-hq-flags', 'syncHqFlags', hqFlags);
        this.persistToJsonAsset('trade-flags', tradeFlags);
        this.persistToJsonAsset('item-equip-slot-category', equipSlotCategoryId);
        this.persistToJsonAsset('market-items', marketItems);
        this.persistToJsonAsset('baits', baits);
        this.persistToJsonAsset('extractable-items', extractableItems);
        this.persistToJsonAsset('item-set-bonuses', itemSetBonuses);
        this.persistToJsonAsset('aetherial-reduce', aetherialReduce);
        this.persistToJsonAsset('collectable-flags', collectableFlags);
        this.persistToJsonAsset('item-stats', itemStats);
        this.persistToJsonAsset('item-bonuses', itemBonuses);
        this.persistToJsonAsset('item-patch', itemPatch);
        this.persistToJsonAsset('additional-item-data', additionalItemData);
        this.done();
      });
  }

  private processStats(item: any): any[] {
    const stats = [];
    item.BaseParam.forEach((paramId, index) => {
      if (paramId === 0) {
        return;
      }
      const entry: { ID: number, NQ: number, HQ?: number } = {
        ID: paramId,
        NQ: item.BaseParamValue[index]
      };
      if (item.CanBeHq) {
        let HQ = entry.NQ;
        item.BaseParamSpecial
          .forEach((specialParamId, specialIndex) => {
            if (specialParamId !== paramId) {
              return;
            }
            HQ += item.BaseParamValueSpecial[specialIndex];
          });
        entry.HQ = HQ;
      }
      stats.push(entry);
    });
    return stats;
  }

  private processBonuses(itemFood: any): any[] {
    const bonuses = [];
    itemFood.BaseParam.forEach((paramId, index) => {
      if (paramId === 0) {
        return;
      }
      const entry: { ID: number, NQ: number, HQ: number, Relative: boolean, Max?: number, MaxHQ?: number } = {
        ID: paramId,
        NQ: itemFood.Value[index],
        HQ: itemFood.ValueHQ[index],
        Relative: itemFood.IsRelative[index]
      };
      if (entry.Relative) {
        entry.Max = itemFood.Max[index];
        entry.MaxHQ = itemFood.MaxHQ[index];
      }
      bonuses.push(entry);
    });
    return bonuses;
  }

  getName(): string {
    return 'items';
  }

}
