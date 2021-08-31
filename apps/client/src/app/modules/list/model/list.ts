import { getCraftByPriority, getItemSource, ListRow } from './list-row';
import { CraftAddition } from './craft-addition';
import * as semver from 'semver';
import { ListTag } from './list-tag.enum';
import { DataWithPermissions } from '../../../core/database/permissions/data-with-permissions';
import { ModificationEntry } from './modification-entry';
import { MathTools } from '../../../tools/math-tools';
import { environment } from '../../../../environments/environment';
import { Team } from '../../../model/team/team';
import { ForeignKey } from '../../../core/database/relational/foreign-key';
import { CustomItem } from '../../custom-items/model/custom-item';
import { BehaviorSubject, concat, EMPTY, Observable, of, Subject } from 'rxjs';
import { bufferCount, debounceTime, expand, map, skip, skipUntil, switchMap, tap } from 'rxjs/operators';
import { DataService } from '../../../core/api/data.service';
import { Ingredient } from '../../../model/garland-tools/ingredient';
import { ListManagerService } from '../list-manager.service';
import { ListColor } from './list-color';
import firebase from 'firebase/app';
import { DataType } from '../data/data-type';
import { SettingsService } from '../../settings/settings.service';
import { LazyData } from '../../../core/data/lazy-data';
import { LazyDataService } from '../../../core/data/lazy-data.service';
import { CraftedBy } from './crafted-by';
import { TeamcraftGearsetStats } from '../../../model/user/teamcraft-gearset-stats';
import { deepClone } from 'fast-json-patch';

declare const gtag: Function;

interface CraftAdditionParams {
  _additions: CraftAddition[];
  customItems: CustomItem[];
  dataService: DataService;
  listManager: ListManagerService;
  lazyDataService: LazyDataService;
  gearsets?: TeamcraftGearsetStats[];
  recipeId?: string;
}

export class List extends DataWithPermissions {
  offline?: boolean;

  name: string;

  // For ordering purpose, lower index means higher priority on ordering.
  index = -1;

  hasCommission = false;

  finalItems: ListRow[] = [];

  items: ListRow[] = [];

  note = '';

  // noinspection JSUnusedGlobalSymbols
  createdAt: firebase.firestore.Timestamp;

  // Should we disable HQ suggestions for this list?
  disableHQSuggestions = false;

  version: string = environment.version;

  tags: ListTag[] = [];

  public: boolean;

  forks = 0;

  ephemeral: boolean;

  modificationsHistory: ModificationEntry[] = [];

  @ForeignKey(Team)
  teamId: string;

  // Used for the drag-and-drop feature.
  workshopId?: string;

  color: ListColor;

  archived = false;

  contributionStats = { entries: [], total: 0, ilvlTotal: 0 };

  ignoreRequirementsRegistry: Record<string, 1> = {};

  constructor(settings?: SettingsService) {
    super();
    if (!this.createdAt) {
      this.createdAt = firebase.firestore.Timestamp.fromDate(new Date());
    }

    if (settings) {
      this.everyone = settings.defaultPermissionLevel;
      this.disableHQSuggestions = settings.disableHQSuggestions;
    }
  }

  public get crystals(): ListRow[] {
    return this.items.filter(item => item.id > 1 && item.id < 20);
  }

  public isComplete(): boolean {
    return this.finalItems.length > 0 && !this.finalItems.some(recipe => {
      return recipe.done < recipe.amount;
    });
  }

  public clone(internal = false): List {
    const clone = new List();
    clone.everyone = this.everyone;
    clone.disableHQSuggestions = this.disableHQSuggestions;
    clone.name = this.name;
    clone.version = this.version || '1.0.0';
    clone.tags = this.tags;
    clone.ignoreRequirementsRegistry = this.ignoreRequirementsRegistry;
    if (internal) {
      Object.assign(clone, deepClone(this));
    } else {
      for (const prop of Object.keys(this)) {
        if (['finalItems', 'items', 'note'].indexOf(prop) > -1) {
          clone[prop] = JSON.parse(JSON.stringify(this[prop]));
        }
      }
      gtag('event', 'List', {
        'event_label': 'creation',
        'non_interaction': true
      });
      gtag('event', 'List', {
        'event_label': 'clone',
        'non_interaction': true
      });
      this.forks++;
      clone.reset();
    }
    clone.createdAt = this.createdAt;
    return clone;
  }

  public reset(): void {
    this.finalItems.forEach(recipe => this.resetDone(recipe));
    this.modificationsHistory = [];
    this.updateAllStatuses();
  }

  /**
   * Iterates on every item in the list, from recipes to crystals.
   * @param {(arg: ListRow) => void} method
   */
  public forEach(method: (arg: ListRow) => void): void {
    this.items.forEach(method);
    this.finalItems.forEach(method);
  }

  /**
   * Iterates on recipes and preCrafts.
   * @param {(arg: ListRow) => void} method
   */
  public forEachItemWithRequirement(method: (arg: ListRow) => void): void {
    (this.items || []).filter(row => row.requires !== undefined && row.requires.length > 0).forEach(method);
    (this.finalItems || []).filter(row => row.requires !== undefined && row.requires.length > 0).forEach(method);
  }

  public getContributionStats(entries: ModificationEntry[], lazyData: LazyDataService) {
    return entries.filter(entry => entry.amount > 0)
      .reduce((stats, entry) => {
        let statsRow = stats.entries.find(s => s.userId === entry.userId);
        if (statsRow === undefined) {
          stats.entries.push({
            userId: entry.userId,
            amount: 0,
            ilvlAmount: 0
          });
          statsRow = stats.entries[stats.entries.length - 1];
        }
        statsRow.amount += entry.amount;
        stats.total += entry.amount;
        statsRow.ilvlAmount += entry.amount * lazyData.data.ilvls[entry.itemId];
        stats.ilvlTotal += entry.amount * lazyData.data.ilvls[entry.itemId];
        return stats;
      }, this.contributionStats);
  }

  public addToFinalItems(data: ListRow, lazyData: LazyData): number {
    if (getItemSource(data, DataType.CRAFTED_BY).length === 0) {
      (data.requires || []).forEach(row => {
        let amount = row.amount * (data.amount_needed || data.amount);
        if (row.batches) {
          amount = Math.ceil(amount / row.batches) * row.batches;
        }
        this.add(this.items, {
          id: row.id,
          icon: lazyData.itemIcons[row.id],
          amount: amount,
          done: 0,
          used: 0,
          yield: 1,
          usePrice: true,
          collectable: data.collectable
        });
      });
    }
    return this.add(this.finalItems, data, true);
  }

  /**
   * Merges the list with another one, used for list additions to me more efficient.
   * @param {List} otherList
   * @returns {List}
   */
  public merge(otherList: List): List {
    otherList.items.forEach(item => {
      this.add(this.items, item);
    });
    otherList.finalItems.forEach(recipe => {
      this.add(this.finalItems, recipe, true);
    });
    return this.clean();
  }

  /**
   * Cleans the list, checking amounts and removing useless rows (with amount <= 0).
   * @returns {List}
   */
  public clean(): List {
    for (const prop of Object.keys(this)) {
      if (['finalItems', 'items'].indexOf(prop) > -1) {
        // We don't want to check the amount of items required for recipes, as they can't be wrong (provided by the user only).
        if (prop !== 'finalItems') {
          this[prop].forEach(row => {
            if (getItemSource(row, DataType.CRAFTED_BY).length === 0) {
              row.amount = row.amount_needed = this.totalAmountRequired(row);
            } else {
              row.amount = this.totalAmountRequired(row);
              row.amount_needed = Math.ceil(row.amount / row.yield);
            }
          });
        }
        this[prop] = this[prop].filter(row => row.amount > 0);
      }
    }
    return this;
  }

  public isEmpty(): boolean {
    return this.finalItems.length === 0;
  }

  public requiredAsHQ(item: ListRow): number {
    if (!item || item.id < 20) {
      return 0;
    }
    const recipesNeedingItem = this.finalItems
      .filter(i => i.requires !== undefined)
      .filter(i => {
        return (i.requires || []).some(req => req.id === item.id);
      });
    if (item.requiredAsHQ) {
      return item.amount;
    }
    if (this.disableHQSuggestions) {
      return 0;
    }
    if (recipesNeedingItem.length === 0 || item.requiredAsHQ === false) {
      return 0;
    } else {
      let count = 0;
      recipesNeedingItem.forEach(recipe => {
        count += Math.ceil(recipe.requires.find(req => req.id === item.id).amount * recipe.amount / recipe.yield);
      });
      return Math.max(count, item.amount);
    }
  }

  public getItemById(id: number | string, excludeFinalItems: boolean = false, onlyFinalItems = false, recipeId?: string): ListRow {
    let array = this.items.filter(i => !i.finalItem);
    if (!excludeFinalItems && !onlyFinalItems) {
      array = array.concat(this.finalItems);
    }
    if (onlyFinalItems) {
      array = this.finalItems;
    }
    return array.find(row => {
      let matches = row.id === id || row.id === +id || (row.$key !== undefined && row.$key === id);
      if (recipeId) {
        matches = matches && row.recipeId === recipeId;
      }
      return matches;
    });
  }

  /**
   * Adds items to a given row and tags them as used if they're "done" from another craft.
   *
   * For instance, if you already have Iron ingots, you'll check them into the list, and it'll check the ores needed for the craft,
   * it will also mark them as used as you aren't supposed to have them in your inventory as you used them for the craft.
   *
   * @param {number} itemId
   * @param {number} amount
   * @param {boolean} setUsed
   * @param {boolean} excludeFinalItems
   * @param onlyFinalItems
   * @param recipeId
   * @param external
   * @param initialAddition
   */
  public setDone(itemId: number | string, amount: number, excludeFinalItems = false, onlyFinalItems = false, setUsed = false, recipeId?: string, external = false, initialAddition = amount): void {
    const item = this.getItemById(itemId, excludeFinalItems, onlyFinalItems, recipeId);
    const previousDone = item.amount_needed - MathTools.absoluteCeil((item.amount - item.done) / item.yield);
    if (setUsed) {
      // Save previous used amount
      const previousUsed = item.used;
      // Update used amount
      item.used += amount;
      if (!external && item.used > previousUsed && item.used !== Math.min(item.done + amount, item.amount)) {
        // Set amount to the amount of items to add to the total.
        amount = Math.max(0, amount - (item.done - previousUsed));
      }
      item.done += amount;
      if (item.used > item.amount) {
        item.used = item.amount;
      }
      if (item.used < 0) {
        item.used = 0;
      }
    } else {
      item.done += amount;
    }
    if (item.done > item.amount) {
      item.done = item.amount;
    }
    if (item.done < 0) {
      item.done = 0;
    }
    this.updateAllStatuses(item.id); //propagate changes
    const newDone = item.amount_needed - MathTools.absoluteCeil((item.amount - item.done) / item.yield);
    amount = newDone - previousDone;
    if (item.requires !== undefined && newDone !== previousDone) {
      for (const requirement of item.requires) {
        const requirementItem = this.getItemById(requirement.id, excludeFinalItems);
        if (requirementItem !== undefined) {
          let nextAmount = requirement.amount * amount;
          // If this is not a precraft, we have to take yields in consideration.
          if (requirementItem.requires === undefined) {
            nextAmount = MathTools.absoluteCeil(nextAmount / requirementItem.yield);
          }
          // If both nextAmount and the addition to used are same sign, we can propagate changes, else we don't want to go further
          // because it's probably because we added items but the requirements is not only for this item,
          // so we don't want to reduce the amount.
          if ((nextAmount <= 0) === (newDone - previousDone <= 0)
            && (nextAmount <= 0) === (initialAddition <= 0)
            && (newDone - previousDone <= 0) === (initialAddition <= 0)) {
            // If the amount of items we did in this iteration hasn't changed, no need to mark requirements as used,
            // as we didn't use more.
            this.setDone(requirement.id, nextAmount, true, false, true, undefined, external, initialAddition);
          }
        }
      }
    }
  }

  canBeCrafted(item: ListRow): boolean {
    if (this.shouldIgnoreRequirements('items', item.id) || this.shouldIgnoreRequirements('finalItems', item.id)) {
      return false;
    }
    const craftedBy = getItemSource(item, DataType.CRAFTED_BY);
    if (craftedBy === undefined || item.requires === undefined) {
      return false;
    }
    let canCraft = true;
    for (const requirement of item.requires) {
      if (canCraft === false) {
        break;
      }
      // If the requirement is a crystal, don't mind it.
      if (requirement.id < 20 && requirement.id > 1) {
        continue;
      }
      const requirementItem = this.getItemById(requirement.id, true);
      if (requirementItem !== undefined) {
        // While each requirement has enough items remaining, you can craft the item.
        // If only one misses, then this will turn false for the rest of the loop
        let requirementAvailableQuantity = requirementItem.done - requirementItem.used;
        // If this is yielding more than one and it's an not exact amount (theorically crafted a float amount)
        // add one to simulate it properly.
        if (item.yield > 1 && ((item.done / item.yield) % 1 !== 0) && requirementAvailableQuantity > 0) {
          requirementAvailableQuantity += requirement.amount;
        }
        canCraft = canCraft &&
          (requirementAvailableQuantity) >= requirement.amount * (item.amount_needed - (item.done / item.yield));
      }
    }
    return canCraft;
  }

  updateAllStatuses(updatedItemId?: number): void {
    const directRequirements = [...this.finalItems, ...this.items].filter(item => {
      return (item.requires || []).length > 0
        && (!updatedItemId || item.requires.some(req => req.id === updatedItemId));
    });
    directRequirements.forEach(item => {
      item.canBeCrafted = this.canBeCrafted(item);
      item.craftableAmount = this.craftableAmount(item);
    });
    this.finalItems.forEach(i => {
      i.hasAllBaseIngredients = (i.requires || []).length > 0 && !i.canBeCrafted && i.done < i.amount && this.hasAllBaseIngredients(i);
    });
    this.items.forEach(i => {
      i.hasAllBaseIngredients = (i.requires || []).length > 0 && !i.canBeCrafted && i.done < i.amount && this.hasAllBaseIngredients(i);
    });
  }

  craftableAmount(item: ListRow): number {
    if (getItemSource(item, DataType.CRAFTED_BY).length === 0 || item.requires === undefined) {
      return 0;
    }
    let amount = 0;
    const itemClone = { ...item };
    let canCraft = true;
    while (canCraft && amount < item.amount) {
      itemClone.done = 0;
      itemClone.amount = amount + 1;
      itemClone.amount_needed = Math.ceil(itemClone.amount / itemClone.yield);
      canCraft = this.canBeCrafted(itemClone);
      if (canCraft) {
        amount++;
      }
    }
    return amount;
  }

  hasAllBaseIngredients(item: ListRow, amount = item.amount): boolean {
    // If it's not a craft, break recursion
    if (getItemSource(item, DataType.CRAFTED_BY).length === 0 || item.requires === undefined) {
      // Simply return the amount of the item being equal to the amount needed.
      return item.done >= amount;
      return item.done - item.used >= amount; //subtracting item.used here probably does something???
    }
    // If we already have the precraft done, don't go further into the requirements.
    if (item.done - item.used >= amount) {  //subtracting item.used here prevents the dotted blue line from appearing around final items which think the materials for a pre-craft exist. 
      return true;
    }
    // Don't mind crystals
    const requirements = item.requires.filter(req => req.id <= 1 || req.id > 20);
    return requirements.reduce((hasAllBaseIngredients, requirement) => {
      const requirementItem = this.getItemById(requirement.id, true);
      if (requirementItem !== undefined) {
        return this.hasAllBaseIngredients(requirementItem, requirement.amount * item.amount_needed) && hasAllBaseIngredients;
      }
    }, true);
  }

  /**
   * Checks if the list is outdated, the implementation is meant to change.
   * @returns {boolean}
   */
  public isOutDated(): boolean {
    if (this.isEmpty()) {
      return false;
    }
    let res = false;
    res = res || (this.version === undefined);
    res = res || semver.ltr(this.version, '6.1.0');
    return res;
  }

  public resetDone(item: ListRow): void {
    item.done = 0;
    item.used = 0;
    if (item.requires !== undefined) {
      item.requires.forEach(requirement => {
        const requirementItem = this.getItemById(requirement.id, true);
        this.resetDone(requirementItem);
      });
    }
  }

  public addCraft({ _additions, customItems, dataService, listManager, lazyDataService, recipeId, gearsets }: CraftAdditionParams): Observable<List> {
    const done$ = new Subject<void>();
    return of(_additions).pipe(
      expand((additions, i) => {
        if (additions.length === 0) {
          done$.next();
          return EMPTY;
        }
        return concat(
          ...additions.map(addition => {
            if (addition.data instanceof CustomItem) {
              return this.addCustomCraft(addition, customItems, dataService, listManager, lazyDataService);
            } else {
              return of(this.addNormalCraft(addition, listManager, lazyDataService, gearsets, recipeId, i === 0));
            }
          })
        ).pipe(
          bufferCount(additions.length),
          map(res => [].concat.apply([], res.filter(r => r !== null)))
        );
      }),
      debounceTime(100),
      skipUntil(done$),
      map(() => {
        return this;
      })
    );
  }

  private addNormalCraft(addition: CraftAddition, listManager: ListManagerService, lazyDataService: LazyDataService, gearsets: TeamcraftGearsetStats[], recipeId: string, finalItem: boolean): CraftAddition[] {
    const nextIteration: CraftAddition[] = [];
    let craft: CraftedBy;
    const crafts = getItemSource(addition.item, DataType.CRAFTED_BY);
    if (recipeId !== undefined) {
      craft = crafts.find(c => c.id.toString() === recipeId.toString()) || crafts[0];
    } else {
      craft = getCraftByPriority(crafts, gearsets);
    }
    const ingredients = craft ? lazyDataService.getRecipeSync(craft.id).ingredients : getItemSource(addition.item, DataType.REQUIREMENTS);
    if (this.shouldIgnoreRequirements(finalItem ? 'finalItems' : 'items', addition.item.id)) {
      return [];
    }
    for (const element of ingredients) {
      // If this is a crystal
      if (element.id < 20 && element.id > 1) {
        this.add(this.items, {
          id: +element.id,
          icon: lazyDataService.data.itemIcons[+element.id],
          amount: element.amount * addition.amount,
          done: 0,
          used: 0,
          yield: 1,
          usePrice: true,
          collectable: false
        });
        listManager.addDetails(this);
      } else {
        const elementDetails = lazyDataService.getExtract(+element.id);
        const craftedBy = getItemSource(elementDetails, DataType.CRAFTED_BY);
        const craftToAdd = getCraftByPriority(craftedBy, gearsets);
        if (elementDetails && getItemSource(elementDetails, DataType.CRAFTED_BY).length > 0) {
          const yields = craftToAdd.yield || 1;
          const added = this.add(this.items, {
            id: elementDetails.id,
            icon: elementDetails.icon,
            amount: element.amount * addition.amount,
            requires: lazyDataService.getRecipeSync(craftToAdd.id).ingredients,
            done: 0,
            used: 0,
            yield: yields,
            usePrice: true,
            collectable: false
          });
          nextIteration.push({
            item: elementDetails,
            amount: added
          });
        } else {
          const rowToAdd: Partial<ListRow> = {
            id: elementDetails.id,
            icon: elementDetails.icon,
            amount: element.amount * addition.amount,
            done: 0,
            used: 0,
            yield: 1,
            usePrice: true
          };
          // Handle possible additional requirements
          const requirements = getItemSource(elementDetails, DataType.REQUIREMENTS);
          if (requirements.length > 0) {
            rowToAdd.requires = requirements;
            const reqAmount = element.amount * addition.amount;
            requirements.forEach(req => {
              const reqDetails = lazyDataService.getExtract(+req.id);
              const reqRecipeId = getItemSource(reqDetails, DataType.CRAFTED_BY)[0]?.id;
              this.add(this.items, {
                id: +req.id,
                icon: lazyDataService.data.itemIcons[+req.id],
                amount: Math.ceil(reqAmount / req.amount) * req.amount,
                done: 0,
                used: 0,
                yield: 1,
                usePrice: true,
                requires: reqRecipeId ? lazyDataService.getRecipeSync(reqRecipeId).ingredients : getItemSource(reqDetails, DataType.REQUIREMENTS),
                collectable: false
              });
              nextIteration.push({
                item: lazyDataService.getExtract(+req.id),
                amount: Math.ceil(reqAmount / req.amount) * req.amount
              });
            });
          }
          this.add(this.items, rowToAdd as ListRow);
        }
        listManager.addDetails(this);
      }
    }
    return nextIteration;
  }

  private addCustomCraft(addition: CraftAddition, customItems: CustomItem[], dataService: DataService, listManager: ListManagerService, lazyDataService: LazyDataService): Observable<CraftAddition[]> {
    const item: CustomItem = addition.data as CustomItem;
    const nextIteration: CraftAddition[] = [];
    let index = 0;
    const queue$ = new BehaviorSubject<Ingredient>(item.requires[0]);
    return queue$.pipe(
      switchMap(element => {
        if (element.id < 20 && element.id > 1) {
          this.add(this.items, {
            id: +element.id,
            icon: lazyDataService.data.itemIcons[+element.id],
            amount: element.amount * addition.amount,
            done: 0,
            used: 0,
            yield: 1,
            usePrice: true,
            collectable: false
          });
          listManager.addDetails(this);
          return of(null);
        } else {
          if (element.custom) {
            const itemDetails = customItems.find(i => i.$key === element.id);
            const itemDetailsClone = new CustomItem();
            Object.assign(itemDetailsClone, itemDetails);
            itemDetailsClone.amount = element.amount * addition.amount;
            itemDetailsClone.done = 0;
            itemDetailsClone.used = 0;
            itemDetailsClone.usePrice = true;
            itemDetailsClone.id = itemDetails.$key;
            const added = this.add(this.items, itemDetailsClone);
            if (itemDetailsClone.requires !== undefined) {
              return of({
                data: itemDetailsClone,
                amount: added
              });
            }
            return of(null);
          } else {
            return dataService.getItem(+element.id).pipe(
              map(elementItemData => {
                const elementDetails = elementItemData.item;
                if (elementDetails.isCraft()) {
                  const yields = elementDetails.craft[0].yield || 1;
                  const added = this.add(this.items, {
                    id: elementDetails.id,
                    icon: elementDetails.icon,
                    amount: element.amount * addition.amount,
                    requires: elementDetails.craft[0].ingredients,
                    done: 0,
                    used: 0,
                    yield: yields,
                    usePrice: true,
                    collectable: false
                  });
                  return {
                    item: elementDetails,
                    data: elementItemData,
                    amount: added
                  };
                } else {
                  this.add(this.items, {
                    id: elementDetails.id,
                    icon: elementDetails.icon,
                    amount: element.amount * addition.amount,
                    done: 0,
                    used: 0,
                    yield: 1,
                    usePrice: true,
                    collectable: false
                  });
                }
                listManager.addDetails(this);
              })
            );
          }
        }
      }),
      tap((res) => {
        if (res !== null && res !== undefined) {
          nextIteration.push(res);
        }
        index++;
        if (item.requires[index] !== undefined) {
          queue$.next(item.requires[index]);
        }
      }),
      skip(item.requires.length - 1),
      map(() => {
        return nextIteration;
      })
    );
  }

  private add(array: ListRow[], data: ListRow, recipe = false): number {
    let previousAmount = 0;
    let row = array.find(r => {
      return (r.id === data.id && r.recipeId === data.recipeId) || (r.$key !== undefined && r.$key === data.$key);
    });
    if (row === undefined) {
      array.push(data);
      row = array[array.length - 1];
    } else {
      row.amount = MathTools.absoluteCeil(row.amount + data.amount);
      previousAmount = row.amount_needed;
    }
    row.amount_needed = Math.ceil(row.amount / (row.yield || 1));
    const added = row.amount_needed - previousAmount;
    if (added < 0 && recipe) {
      const previousDone = row.done;
      if (previousDone > row.amount_needed) {
        this.setDone(row.id, row.amount_needed - previousDone, !recipe, recipe, false, data.recipeId);
      }
    }
    this.updateAllStatuses();
    return added;
  }

  public isLarge(): boolean {
    return this.items && this.items.length >= 100 || this.finalItems && this.finalItems.length > 50;
  }

  public isTooLarge(): boolean {
    return this.items.length + this.finalItems.length > 1000;
  }

  /**
   * Gets the total amount needed for a given item based on requirements of the crafts in the list.
   * @param {ListRow} item
   * @returns {number}
   */
  private totalAmountRequired(item: ListRow): number {
    if (this.getItemById(item.id) === undefined) {
      return 0;
    }
    let count = 0;
    this.forEachItemWithRequirement(craft => {
      // We have to use filter because some items (airships) might require twice the same item.
      const requirements = (craft.requires || []).filter(req => req.id === item.id || +req.id === item.id);
      if (requirements.length > 0) {
        requirements.forEach(requirement => {
          const amount = (craft.amount_needed || craft.amount) * requirement.amount;
          const batches = requirement.batches || 1;
          count += Math.ceil(amount / batches) * batches;
        });
      }
    });
    return count;
  }

  afterDeserialized(): void {
    if (typeof this.createdAt !== 'object') {
      this.createdAt = firebase.firestore.Timestamp.fromDate(new Date(this.createdAt));
    } else if (!(this.createdAt instanceof firebase.firestore.Timestamp)) {
      this.createdAt = new firebase.firestore.Timestamp((this.createdAt as any).seconds, (this.createdAt as any).nanoseconds);
    }
    // lmao nice hotfix
    if (!this.name) {
      console.log('List has no name', this.$key);
    }
    if ((<any>this.name)?.name) {
      this.name = (<any>this.name).name;
    }
  }

  shouldIgnoreRequirements(array: 'items' | 'finalItems', itemId: number): boolean {
    return (this.ignoreRequirementsRegistry || {})[`${array}:${itemId}`] === 1;
  }

  setIgnoreRequirements(array: 'items' | 'finalItems', itemId: number, ignore: boolean): void {
    this.ignoreRequirementsRegistry = this.ignoreRequirementsRegistry || {};
    if (ignore) {
      this.ignoreRequirementsRegistry[`${array}:${itemId}`] = 1;
    } else {
      delete this.ignoreRequirementsRegistry[`${array}:${itemId}`];
    }
  }
}
