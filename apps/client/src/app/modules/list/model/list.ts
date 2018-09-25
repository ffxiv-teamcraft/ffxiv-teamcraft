import { ListRow } from './list-row';
import { CraftAddition } from './craft-addition';
import { GarlandToolsService } from '../../../core/api/garland-tools.service';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import * as semver from 'semver';
import { ListTag } from './list-tag.enum';
import { ResourceComment } from '../../comments/resource-comment';
import { Craft } from '../../../model/garland-tools/craft';
import { DataWithPermissions } from '../../../core/database/permissions/data-with-permissions';
import { ModificationEntry } from './modification-entry';
import { MathTools } from '../../../tools/math-tools';
import { environment } from '../../../../environments/environment';

declare const ga: Function;

export class List extends DataWithPermissions {
  name: string;

  // For ordering purpose, lower index means higher priority on ordering.
  index = -1;

  finalItems: ListRow[] = [];

  items: ListRow[] = [];

  note = '';

  // noinspection JSUnusedGlobalSymbols
  createdAt: string = new Date().toISOString();

  version: string = environment.version;

  tags: ListTag[] = [];

  public: boolean;

  forks = 0;

  ephemeral: boolean;

  comments: ResourceComment[];

  // Related to commissions
  commissionId?: string;

  commissionServer?: string;

  modificationsHistory: ModificationEntry[] = [];

  teamId: string;

  constructor() {
    super();
  }

  public get crystals():ListRow[]{
    return this.items.filter(item => item.id > 1 && item.id < 20);
  }

  public get isCommissionList(): boolean {
    return this.commissionId !== undefined && this.commissionServer !== undefined;
  }

  public isComplete(): boolean {
    return this.finalItems.filter(recipe => recipe.done < recipe.amount).length === 0;
  }

  public clone(): List {
    const clone = new List();
    for (const prop of Object.keys(this)) {
      if (['finalItems', 'preCrafts', 'gathers', 'others', 'crystals', 'note'].indexOf(prop) > -1) {
        clone[prop] = JSON.parse(JSON.stringify(this[prop]));
      }
    }
    clone.name = this.name;
    clone.version = this.version || '1.0.0';
    clone.tags = this.tags;
    delete clone.$key;
    ga('send', 'event', 'List', 'creation');
    ga('send', 'event', 'List', 'clone');
    this.forks++;
    clone.reset();
    return clone;
  }

  public reset(): void {
    this.finalItems.forEach(recipe => this.resetDone(recipe));
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
  public forEachCraft(method: (arg: ListRow) => void): void {
    (this.items || []).filter(row => row.craftedBy !== undefined && row.craftedBy.length > 0).forEach(method);
    (this.finalItems || []).filter(row => row.craftedBy !== undefined && row.craftedBy.length > 0).forEach(method);
  }

  public addToFinalItems(data: ListRow): number {
    return this.add(this.finalItems, data, true);
  }

  /**
   * Merges the list with another one, used for list additions to me more efficient.
   * @param {List} otherList
   * @returns {List}
   */
  public merge(otherList: List): List {
    otherList.items.forEach(crystal => {
      this.add(this.items, crystal);
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
            if (row.craftedBy === undefined || row.craftedBy.length === 0) {
              row.amount = row.amount_needed = this.totalAmountRequired(<ListRow>row);
            } else {
              row.amount = this.totalAmountRequired(<ListRow>row);
              row.amount_needed = Math.ceil(row.amount / row.yield);
            }
          });
        }
        this[prop] = this[prop].filter(row => row.amount > 0);
      }
    }
    return this;
  }

  /**
   * Checks if a list is large or not, mostly used for display purpose.
   * @returns {boolean}
   */
  public isLarge(): boolean {
    let size = 0;
    size += this.finalItems.length;
    size += this.items.length;
    return size > 100;
  }

  public isEmpty(): boolean {
    return this.finalItems.length === 0 &&
      this.items.length === 0;
  }

  public getItemById(id: number, excludeFinalItems: boolean = false): ListRow {
    const array = excludeFinalItems ? this.items : this.items.concat(this.finalItems);
    return array.find(row => row.id === id);
  }

  /**
   * Adds items to a given row and tags them as used if they're "done" from another craft.
   *
   * For instance, if you already have Iron ingots, you'll check them into the list, and it'll check the ores needed for the craft,
   * it will also mark them as used as you aren't supposed to have them in your inventory as you used them for the craft.
   *
   * @param {ListRow} pitem
   * @param {number} amount
   * @param {boolean} setUsed
   * @param {boolean} excludeRecipes
   * @param initialAddition
   */
  public setDone(pitem: ListRow, amount: number, excludeRecipes = false, setUsed = false, initialAddition = amount): void {
    const item = this.getItemById(pitem.id, excludeRecipes);
    const previousDone = MathTools.absoluteCeil(item.done / item.yield);
    if (setUsed) {
      // Save previous used amount
      const previousUsed = item.used;
      // Update used amount
      item.used += amount;
      if (item.used > previousUsed && item.used >= Math.max(item.done + amount, item.amount)) {
        // Set amount to the amount of items to add to the total.
        amount = amount - (item.done - previousUsed);
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
    amount = MathTools.absoluteCeil(amount / pitem.yield);
    const newDone = MathTools.absoluteCeil(item.done / item.yield);
    if (item.requires !== undefined && newDone !== previousDone) {
      for (const requirement of item.requires) {
        const requirementItem = this.getItemById(requirement.id, excludeRecipes);
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
            this.setDone(requirementItem, nextAmount, true, previousDone !== item.done, initialAddition);
          }
        }
      }
    }
  }

  canBeCrafted(item: ListRow): boolean {
    if (item.craftedBy === undefined || item.craftedBy.length === 0 || item.requires === undefined) {
      return false;
    }
    let canCraft = true;
    for (const requirement of item.requires) {
      // If the requirement is a crystal, don't mind it.
      if (requirement.id < 20 && requirement.id > 1) {
        continue;
      }
      const requirementItem = this.getItemById(requirement.id, true);
      if (requirementItem !== undefined) {
        // While each requirement has enough items remaining, you can craft the item.
        // If only one misses, then this will turn false for the rest of the loop
        canCraft = canCraft &&
          (requirementItem.done - requirementItem.used) >= requirement.amount * (item.amount_needed - (item.done / item.yield));
      }
    }
    return canCraft;
  }

  hasAllBaseIngredients(item: ListRow, amount = item.amount): boolean {
    // If it's not a craft, break recursion
    if (item.craftedBy === undefined || item.craftedBy.length === 0 || item.requires === undefined) {
      // Simply return the amount of the item being equal to the amount needed.
      return item.done >= amount;
    }
    // If we already have the precraft done, don't go further into the requirements.
    if (item.done >= amount) {
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
    res = res || semver.ltr(this.version, '5.0.0');
    return res;
  }

  public onlyNeedsCrafts(): boolean {
    // We init a boolean to true for the result.
    let onlyNeedsCrafts = true;
    // If one of the non-craftable items is not finished, set the boolean to false
    this.forEach((row) => {
      if (row.id < 20 && row.id > 1) {
        return;
      }
      if (row.craftedBy === undefined || row.craftedBy.length === 0) {
        onlyNeedsCrafts = onlyNeedsCrafts && row.done >= row.amount;
      }
    });
    return onlyNeedsCrafts;
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

  public addCraft(additions: CraftAddition[], gt: GarlandToolsService, i18n: I18nToolsService, recipeId?: string): List {
    const nextIteration: CraftAddition[] = [];
    for (const addition of additions) {
      let craft: Craft;
      if (recipeId !== undefined) {
        craft = addition.item.craft.find(c => c.id.toString() === recipeId.toString());
      } else {
        craft = addition.item.craft[0];
      }
      for (const element of craft.ingredients) {
        // If this is a crystal
        if (element.id < 20 && element.id > 1) {
          const crystal = gt.getCrystalDetails(element.id);
          this.add(this.items, {
            id: element.id,
            icon: crystal.icon,
            amount: element.amount * addition.amount,
            done: 0,
            used: 0,
            yield: 1,
            usePrice: true
          });
        } else {
          const elementDetails = addition.data.getIngredient(element.id);
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
              usePrice: true
            });
            nextIteration.push({
              item: elementDetails,
              data: addition.data,
              amount: added
            });
          } else {
            this.add(this.items, {
              id: elementDetails.id,
              icon: elementDetails.icon,
              amount: element.amount * addition.amount,
              done: 0,
              used: 0,
              yield: 1,
              usePrice: true
            });
          }
        }
      }
    }
    if (nextIteration.length > 0) {
      return this.addCraft(nextIteration, gt, i18n);
    }
    return this;
  }

  private add(array: ListRow[], data: ListRow, recipe = false): number {
    let previousAmount = 0;
    let row = array.find(r => {
      return r.id === data.id;
    });
    if (row === undefined) {
      array.push(data);
      row = array[array.length - 1];
    } else {
      row.amount = MathTools.absoluteCeil(row.amount + data.amount);
      previousAmount = row.amount_needed;
    }
    row.amount_needed = Math.ceil(row.amount / row.yield);
    const added = row.amount_needed - previousAmount;
    if (added < 0 && recipe) {
      const previousDone = row.done;
      if (previousDone > row.amount_needed) {
        this.setDone(row, row.amount_needed - previousDone);
      }
    }
    return added;
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
    this.forEachCraft(craft => {
      // We have to use filter because some items (airships) might require twice the same item.
      const requirements = (craft.requires || []).filter(req => req.id === item.id);
      if (requirements.length > 0) {
        requirements.forEach(requirement => {
          count += craft.amount_needed * requirement.amount;
        });
      }
    });
    return count;
  }
}
