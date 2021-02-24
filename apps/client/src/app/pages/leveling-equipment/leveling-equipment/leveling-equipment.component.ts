import { ChangeDetectionStrategy, Component } from '@angular/core';
import { InventoryFacade } from '../../../modules/inventory/+state/inventory.facade';
import { LazyDataService } from '../../../core/data/lazy-data.service';
import { Observable, Subject } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from 'apps/client/src/environments/environment';
import { debounceTime, first, map, startWith, switchMap } from 'rxjs/operators';
import { DataService } from '../../../core/api/data.service';
import { TeamcraftGearset } from '../../../model/gearset/teamcraft-gearset';
import { GearsetsFacade } from '../../../modules/gearsets/+state/gearsets.facade';
import { EquipmentPiece } from '../../../model/gearset/equipment-piece';
import { StatsService } from '../../../modules/gearsets/stats.service';
import { BaseParam } from '../../../modules/gearsets/base-param';
import { DataType } from '../../../modules/list/data/data-type';
import { ListPickerService } from '../../../modules/list-picker/list-picker.service';
import { getItemSource, ListRow } from '../../../modules/list/model/list-row';
import { Router } from '@angular/router';
import { UserInventory } from '../../../model/user/inventory/user-inventory';
import { PlatformService } from '../../../core/tools/platform.service';
import { SettingsService } from '../../../modules/settings/settings.service';

@Component({
  selector: 'app-leveling-equipment',
  templateUrl: './leveling-equipment.component.html',
  styleUrls: ['./leveling-equipment.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LevelingEquipmentComponent {

  jobList$: Observable<any[]>;

  search$: Subject<void> = new Subject<void>();

  loading = false;

  pristine = true;

  results$: Observable<{ level: number, gearset: TeamcraftGearset }[]>;

  filtersForm: FormGroup;

  slots: Array<{ property: keyof TeamcraftGearset, name: string, equipSlotCategoryId: number }> = [
    { property: 'mainHand', name: 'MainHand', equipSlotCategoryId: 1 },
    { property: 'offHand', name: 'OffHand', equipSlotCategoryId: 2 },
    { property: 'head', name: 'Head', equipSlotCategoryId: 3 },
    { property: 'chest', name: 'Body', equipSlotCategoryId: 4 },
    { property: 'gloves', name: 'Gloves', equipSlotCategoryId: 5 },
    { property: 'belt', name: 'Waist', equipSlotCategoryId: 6 },
    { property: 'legs', name: 'Legs', equipSlotCategoryId: 7 },
    { property: 'feet', name: 'Feet', equipSlotCategoryId: 8 },
    { property: 'earRings', name: 'Ears', equipSlotCategoryId: 9 },
    { property: 'necklace', name: 'Neck', equipSlotCategoryId: 10 },
    { property: 'bracelet', name: 'Wrists', equipSlotCategoryId: 11 },
    { property: 'ring1', name: 'FingerL', equipSlotCategoryId: 12 },
    { property: 'ring2', name: 'FingerR', equipSlotCategoryId: 12 }
  ];

  selectedItems: Partial<Record<keyof TeamcraftGearset, number>> = {};

  desktop = this.platformService.isDesktop();

  constructor(private inventoryFacade: InventoryFacade, private lazyData: LazyDataService,
              private fb: FormBuilder, private dataService: DataService,
              private gearsetsFacade: GearsetsFacade, private statsService: StatsService,
              private listPicker: ListPickerService, private router: Router,
              private platformService: PlatformService, private settings: SettingsService) {
    this.jobList$ = this.lazyData.data$.pipe(
      map(data => {
        return Object.keys(data.jobName).map(key => +key);
      })
    );

    this.filtersForm = this.fb.group({
      job: [null, Validators.required],
      level: [null, [Validators.required, Validators.min(3), Validators.max(environment.maxLevel - 1)]],
      includeCrafting: [this.settings.getBoolean('leveling-equipment:includeCrafting', true)],
      includeTrades: [this.settings.getBoolean('leveling-equipment:includeTrades', true)],
      onlyInventoryContent: [this.desktop ? this.settings.getBoolean('leveling-equipment:onlyInventoryContent', false) : false]
    });

    this.results$ = this.search$.pipe(
      switchMap(() => {
        return this.inventoryFacade.inventory$.pipe(
          startWith(null as UserInventory),
          debounceTime(10),
          first()
        );
      }),
      map((inventory: UserInventory | null) => {
        const filters = this.filtersForm.value;
        this.settings.setBoolean('leveling-equipment:includeCrafting', filters.includeCrafting);
        this.settings.setBoolean('leveling-equipment:includeTrades', filters.includeTrades);
        this.settings.setBoolean('leveling-equipment:onlyInventoryContent', filters.onlyInventoryContent);
        const mainStat = this.statsService.getMainStat(filters.job);
        // Preparing base informations
        const levels = [-2, -1, 0, 1, 2].map(diff => filters.level + diff).filter(lvl => lvl < environment.maxLevel - 1);
        const baseStruct = levels.map(level => {
          const gearset = new TeamcraftGearset();
          gearset.job = filters.job;
          return {
            level,
            gearset
          };
        });
        const results = baseStruct.map(row => {
          // Let's check offHand first, as it's a bit specific
          if (!row.gearset.offHand && row.gearset.job !== 18 && (!row.gearset.isCombatSet() || [1, 19].includes(row.gearset.job))) {
            row.gearset.offHand = this.getSlotPiece(row.level, mainStat, 2, filters.includeCrafting, filters.includeTrades, filters.onlyInventoryContent, inventory, filters.job);
          }
          this.slots
            .filter(slot => !['ring2', 'offHand'].includes(slot.property))
            .forEach(slot => {
              if (!row.gearset[slot.property] && this.gearsetsFacade.canEquipSlot(slot.name, row.gearset.chest?.itemId, row.gearset.legs?.itemId)) {
                (row as any).gearset[slot.property] = this.getSlotPiece(row.level, mainStat, slot.equipSlotCategoryId, filters.includeCrafting, filters.includeTrades, filters.onlyInventoryContent, inventory, filters.job);
                if (row.gearset[slot.property] && this.desktop) {
                  row.gearset[slot.property].isInInventory = inventory.hasItem(row.gearset[slot.property].itemId, true);
                }
              }
            });
          // Then, once we filled everything, fix second ring :)
          if (!row.gearset.ring2) {
            if (row.gearset.ring1) {
              if (this.lazyData.data.equipment[row.gearset.ring1.itemId].unique) {
                row.gearset.ring2 = this.getSlotPiece(row.level, mainStat, 12, filters.includeCrafting, filters.includeTrades, filters.onlyInventoryContent, inventory, filters.job);
                if (row.gearset.ring2 && this.desktop) {
                  (row.gearset.ring2 as any).isInInventory = inventory.hasItem(row.gearset.ring2.itemId, true);
                }
              } else {
                row.gearset.ring2 = JSON.parse(JSON.stringify(row.gearset.ring1));
              }
            }
          }
          return row;
        });
        const columnToSelect = results.find(r => r.level === filters.level);
        this.selectRow(columnToSelect);
        return results;
      })
    );
  }

  private allowItem(itemId: number, includeCrafting: boolean, includeTrades: boolean, onlyInventory: boolean, inventory: UserInventory): boolean {
    if (onlyInventory && inventory) {
      return inventory.hasItem(itemId, true);
    }
    const extract = this.lazyData.getExtract(itemId);
    // If it can be bought, no need to go further
    const vendors = getItemSource(extract, DataType.VENDORS).filter(vendor => !vendor.festival);
    // If it can be bought from calamity salvager, it's not something we want to provide as item for the leveling equipment.
    const fromCalamitySalvager = vendors.some(v => v.npcId === 1017613);
    if (!fromCalamitySalvager && vendors.length > 0) {
      return true;
    }
    if (includeCrafting && extract.sources.some(source => source.type === DataType.CRAFTED_BY)) {
      return true;
    }
    const trades = getItemSource(extract, DataType.TRADE_SOURCES).filter(trade => trade.npcs.some(npc => !npc.festival));
    return includeTrades && trades.length > 0;
  }

  private getSlotPiece(level: number, mainStat: BaseParam, equipSlotCategory: number, includeCrafting: boolean, includeTrades: boolean, onlyInventory: boolean, inventory: UserInventory, job: number): EquipmentPiece & { isInInventory: boolean } | null {
    const itemId = Object.keys(this.lazyData.data.equipment)
      .filter(key => {
        return this.lazyData.data.equipment[key].equipSlotCategory === equipSlotCategory
          && this.lazyData.data.equipment[key].level <= level
          && this.lazyData.data.equipment[key].jobs.includes(this.lazyData.data.jobAbbr[job]?.en.toUpperCase());
      })
      .filter(key => this.allowItem(+key, includeCrafting, includeTrades, onlyInventory, inventory))
      .sort((a, b) => {
        const aMainStat = this.getMainStatValue(+a, mainStat, equipSlotCategory, job);
        const bMainStat = this.getMainStatValue(+b, mainStat, equipSlotCategory, job);
        const mainDiff = bMainStat - aMainStat;
        if (mainDiff === 0) {
          const aSecondaryStat = this.getSecondaryStatValue(+a, mainStat, equipSlotCategory, job);
          const bSecondaryStat = this.getSecondaryStatValue(+b, mainStat, equipSlotCategory, job);
          return bSecondaryStat - aSecondaryStat;
        }
        return bMainStat - aMainStat;
      })[0];

    if (!itemId) {
      return null;
    }
    const itemMeldingData = this.lazyData.data.itemMeldingData[itemId];
    return {
      itemId: +itemId,
      hq: false,
      materias: [],
      materiaSlots: itemMeldingData.slots,
      canOvermeld: itemMeldingData.overmeld,
      baseParamModifier: itemMeldingData.modifier,
      isInInventory: inventory && inventory.hasItem(+itemId, true)
    };
  }

  private getMainStatValue(itemId: number, mainStat: number, equipSlotCategory: number, job: number): number {
    if ([9, 10, 11, 12].includes(equipSlotCategory)) {
      if ([16, 17, 18].includes(job)) {
        mainStat = BaseParam.GP;
      }
      if ([8, 9, 10, 11, 12, 13, 14, 15].includes(job)) {
        mainStat = BaseParam.CP;
      }
    }
    const mainStatEntry = this.lazyData.data.itemStats[itemId]?.find(stat => stat.ID === mainStat);
    if (mainStatEntry > 0) {
      return mainStatEntry?.NQ || 0;
    } else if ([16, 17, 18].includes(job)) {
      return this.lazyData.data.itemStats[itemId]?.find(stat => stat.ID === BaseParam.PERCEPTION)?.NQ || 0;
    } else if ([8, 9, 10, 11, 12, 13, 14, 15].includes(job)) {
      return this.lazyData.data.itemStats[itemId]?.find(stat => stat.ID === BaseParam.CONTROL)?.NQ || 0;
    }
    return 0;
  }

  private getSecondaryStatValue(itemId: number, mainStat: number, equipSlotCategory: number, job: number): number {
    let secondaryStat = BaseParam.DEFENSE;
    if ([9, 10, 11, 12].includes(equipSlotCategory)) {
      if ([16, 17, 18].includes(job)) {
        secondaryStat = BaseParam.GATHERING;
      }
      if ([8, 9, 10, 11, 12, 13, 14, 15].includes(job)) {
        secondaryStat = BaseParam.CRAFTSMANSHIP;
      }
    } else {
      switch (mainStat) {
        case BaseParam.VITALITY:
          secondaryStat = BaseParam.TENACITY;
          break;
        case BaseParam.STRENGTH:
        case BaseParam.DEXTERITY:
          secondaryStat = BaseParam.SKILL_SPEED;
          break;
        case BaseParam.INTELLIGENCE:
          secondaryStat = BaseParam.SPELL_SPEED;
          break;
        case BaseParam.MIND:
          secondaryStat = BaseParam.PIETY;
          break;
      }
    }
    const secondaryStatEntry = this.lazyData.data.itemStats[itemId]?.find(stat => stat.ID === secondaryStat);
    return secondaryStatEntry?.NQ || 0;
  }

  selectRow(row: { level: number, gearset: TeamcraftGearset }): void {
    this.selectedItems = this.gearsetsFacade
      .toArray(row.gearset)
      .reduce((acc, item) => {
        return {
          ...acc,
          [item.slot]: item.piece.itemId
        };
      }, {});
  }

  createList(): void {
    const items: ListRow[] = Object.values(this.selectedItems)
      .filter(id => !!id)
      .map(itemId => {
        return {
          id: itemId,
          amount: 1,
          done: 0,
          used: 0,
          yield: 1
        };
      });
    this.listPicker.addToList(...items).subscribe(list => {
      this.router.navigate(['/list', list.$key]);
    });
  }

}
