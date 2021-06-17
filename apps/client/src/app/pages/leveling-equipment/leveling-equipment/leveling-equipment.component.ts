import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LazyDataService } from '../../../core/data/lazy-data.service';
import { Observable, Subject } from 'rxjs';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
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
import { InventoryService } from '../../../modules/inventory/inventory.service';

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

  slots: Array<{ property: keyof TeamcraftGearset, name: string, equipSlotCategoryIds: number[] }> = [
    { property: 'mainHand', name: 'MainHand', equipSlotCategoryIds: [1, 13] },
    { property: 'offHand', name: 'OffHand', equipSlotCategoryIds: [2] },
    { property: 'head', name: 'Head', equipSlotCategoryIds: [3] },
    { property: 'chest', name: 'Body', equipSlotCategoryIds: [4] },
    { property: 'gloves', name: 'Gloves', equipSlotCategoryIds: [5] },
    { property: 'belt', name: 'Waist', equipSlotCategoryIds: [6] },
    { property: 'legs', name: 'Legs', equipSlotCategoryIds: [7] },
    { property: 'feet', name: 'Feet', equipSlotCategoryIds: [8] },
    { property: 'earRings', name: 'Ears', equipSlotCategoryIds: [9] },
    { property: 'necklace', name: 'Neck', equipSlotCategoryIds: [10] },
    { property: 'bracelet', name: 'Wrists', equipSlotCategoryIds: [11] },
    { property: 'ring1', name: 'FingerL', equipSlotCategoryIds: [12] },
    { property: 'ring2', name: 'FingerR', equipSlotCategoryIds: [12] }
  ];

  selectedItems: Partial<Record<keyof TeamcraftGearset, number>> = {};

  desktop = this.platformService.isDesktop();

  constructor(private inventoryFacade: InventoryService, private lazyData: LazyDataService,
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
      includePurchases: [this.settings.getBoolean('leveling-equipment:includePurchases', true)],
      onlyInventoryContent: [this.desktop ? this.settings.getBoolean('leveling-equipment:onlyInventoryContent', false) : false]
    }, {
      validators: (control: AbstractControl) => {
        if (control.value.includeCrafting || control.value.includeTrades || control.value.includePurchases) {
          return null;
        }
        return { noInclude: true };
      }
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
        this.settings.setBoolean('leveling-equipment:includePurchases', filters.includePurchases);
        this.settings.setBoolean('leveling-equipment:onlyInventoryContent', filters.onlyInventoryContent);
        const mainStat = this.statsService.getMainStat(filters.job);
        // Preparing base informations
        const levels = [-2, -1, 0, 1, 2].map(diff => filters.level + diff).filter(lvl => lvl < environment.maxLevel);
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
            row.gearset.offHand = this.getSlotPiece(row.level, mainStat, [2], filters, inventory, filters.job);
          }
          this.slots
            .filter(slot => !['ring2', 'offHand'].includes(slot.property))
            .forEach(slot => {
              if (!row.gearset[slot.property] && this.gearsetsFacade.canEquipSlot(slot.name, row.gearset.chest?.itemId, row.gearset.legs?.itemId)) {
                (row as any).gearset[slot.property] = this.getSlotPiece(row.level, mainStat, slot.equipSlotCategoryIds, filters, inventory, filters.job);
                if (row.gearset[slot.property] && this.desktop) {
                  row.gearset[slot.property].isInInventory = inventory.hasItem(row.gearset[slot.property].itemId, true);
                }
              }
            });
          // Then, once we filled everything, fix second ring :)
          if (!row.gearset.ring2) {
            if (row.gearset.ring1) {
              if (this.lazyData.data.equipment[row.gearset.ring1.itemId].unique) {
                row.gearset.ring2 = this.getSlotPiece(row.level, mainStat, [12], filters, inventory, filters.job);
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
        if (columnToSelect) {
          this.selectRow(columnToSelect);
        } else {
          this.selectRow(results[results.length - 1]);
        }
        return results;
      })
    );
  }

  private allowItem(itemId: number, filters: any, inventory: UserInventory): boolean {
    if (filters.onlyInventory && inventory) {
      return inventory.hasItem(itemId, true);
    }
    const extract = this.lazyData.getExtract(itemId);
    // If the item has a masterbook requirement, it's not worth getting it for leveling.
    if (getItemSource(extract, DataType.MASTERBOOKS).length > 0) {
      return false;
    }
    // If it can be bought, no need to go further
    const vendors = getItemSource(extract, DataType.VENDORS).filter(vendor => !vendor.festival);
    // If it can be bought from calamity salvager, it's not something we want to provide as item for the leveling equipment.
    const fromCalamitySalvager = vendors.some(v => v.npcId === 1017613);
    if (fromCalamitySalvager) {
      return false;
    }
    if (filters.includePurchases && vendors.length > 0) {
      return true;
    }
    if (filters.includeCrafting && (extract.sources || []).some(source => source.type === DataType.CRAFTED_BY)) {
      return true;
    }
    const trades = getItemSource(extract, DataType.TRADE_SOURCES).filter(trade => trade.npcs.some(npc => !npc.festival));
    return filters.includeTrades && trades.length > 0;
  }

  private getSlotPiece(level: number, mainStat: BaseParam, equipSlotCategories: number[], filters: any, inventory: UserInventory, job: number): EquipmentPiece & { isInInventory: boolean } | null {
    const itemId = +Object.keys(this.lazyData.data.equipment)
      .filter(key => {
        return equipSlotCategories.includes(this.lazyData.data.equipment[key].equipSlotCategory)
          && this.lazyData.data.equipment[key].level <= level
          && this.lazyData.data.equipment[key].jobs.includes(this.lazyData.data.jobAbbr[job]?.en.toUpperCase());
      })
      .filter(key => this.allowItem(+key, filters, inventory))
      .sort((a, b) => {
        const aMainStat = this.getMainStatValue(+a, mainStat, equipSlotCategories, job);
        const bMainStat = this.getMainStatValue(+b, mainStat, equipSlotCategories, job);
        const mainDiff = bMainStat - aMainStat;
        if (mainDiff === 0) {
          const aSecondaryStat = this.getSecondaryStatValue(+a, mainStat, equipSlotCategories, job);
          const bSecondaryStat = this.getSecondaryStatValue(+b, mainStat, equipSlotCategories, job);
          return bSecondaryStat - aSecondaryStat;
        }
        return mainDiff;
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

  private getMainStatValue(itemId: number, mainStat: number, equipSlotCategories: number[], job: number): number {
    const isRightHandSide = [9, 10, 11, 12].some(category => equipSlotCategories.includes(category));
    if (isRightHandSide) {
      if ([16, 17, 18].includes(job)) {
        mainStat = BaseParam.GP;
      }
      if ([8, 9, 10, 11, 12, 13, 14, 15].includes(job)) {
        mainStat = BaseParam.CP;
      }
    }

    const mainStatEntry = this.lazyData.data.itemStats[itemId]?.find(stat => stat.ID === mainStat);

    let bonus = 0;
    if (!isRightHandSide && [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18].includes(job)) {
      bonus = this.getSecondaryStatValue(itemId, mainStat, equipSlotCategories, job);
    }
    if (mainStatEntry) {
      return bonus + mainStatEntry?.NQ || 0;
    } else if ([16, 17, 18].includes(job)) {
      return bonus + this.lazyData.data.itemStats[itemId]?.find(stat => stat.ID === BaseParam.PERCEPTION)?.NQ || 0;
    } else if ([8, 9, 10, 11, 12, 13, 14, 15].includes(job)) {
      return bonus + this.lazyData.data.itemStats[itemId]?.find(stat => stat.ID === BaseParam.CONTROL)?.NQ || 0;
    }
    return 0;
  }

  private getSecondaryStatValue(itemId: number, mainStat: number, equipSlotCategories: number[], job: number): number {
    let secondaryStat = BaseParam.DEFENSE;
    if ([9, 10, 11, 12].some(category => equipSlotCategories.includes(category))) {
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
        case BaseParam.CP:
        case BaseParam.CRAFTSMANSHIP:
          secondaryStat = BaseParam.CONTROL;
          break;
        case BaseParam.GP:
        case BaseParam.GATHERING:
          secondaryStat = BaseParam.PERCEPTION;
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
