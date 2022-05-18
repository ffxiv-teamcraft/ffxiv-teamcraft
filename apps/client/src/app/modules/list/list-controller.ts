import { getCraftByPriority, getItemSource, ListRow } from './model/list-row';
import { deepClone } from 'fast-json-patch';
import { ModificationEntry } from './model/modification-entry';
import { LazyDataWithExtracts } from '../../lazy-data/lazy-data-types';
import { DataType } from './data/data-type';
import { MathTools } from '../../tools/math-tools';
import * as semver from 'semver';
import { BehaviorSubject, combineLatest, concat, EMPTY, Observable, of, Subject } from 'rxjs';
import { bufferCount, debounceTime, expand, map, skip, skipUntil, switchMap, tap } from 'rxjs/operators';
import { CustomItem } from '../custom-items/model/custom-item';
import { CraftAddition } from './model/craft-addition';
import { ListManagerService } from './list-manager.service';
import { LazyDataFacade } from '../../lazy-data/+state/lazy-data.facade';
import { TeamcraftGearsetStats } from '../../model/user/teamcraft-gearset-stats';
import { CraftedBy } from './model/crafted-by';
import { safeCombineLatest } from '../../core/rxjs/safe-combine-latest';
import { DataService } from '../../core/api/data.service';
import { Ingredient } from '../../model/garland-tools/ingredient';
import firebase from 'firebase/compat/app';
import { List } from './model/list';
import { Craft } from '@ffxiv-teamcraft/simulator';
import { syncHqFlags } from '../../core/data/sources/sync-hq-flags';


declare const fathom: any;
declare const gtag: Function;

interface CraftAdditionParams {
  _additions: CraftAddition[];
  customItems: CustomItem[];
  dataService: DataService;
  listManager: ListManagerService;
  lazyDataFacade: LazyDataFacade;
  gearsets?: TeamcraftGearsetStats[];
  recipeId?: string;
}

export class ListController {

  public static getCrystals(list: List): ListRow[] {
    return list.items.filter(item => item.id > 1 && item.id < 20);
  }

  public static isComplete(list: List): boolean {
    if (!list) {
      return false;
    }
    return list.finalItems.length > 0 && !list.finalItems.some(recipe => {
      return recipe.done < recipe.amount;
    });
  }

  public static clone(list: List, internal = false): List {
    const clone = new List();
    clone.everyone = list.everyone;
    clone.disableHQSuggestions = list.disableHQSuggestions;
    clone.name = list.name;
    clone.version = list.version || '1.0.0';
    clone.tags = list.tags;
    clone.etag = internal ? list.etag : 0;
    clone.ignoreRequirementsRegistry = list.ignoreRequirementsRegistry;
    if (internal) {
      Object.assign(clone, deepClone(list));
    } else {
      for (const prop of Object.keys(list)) {
        if (['finalItems', 'items', 'note'].indexOf(prop) > -1) {
          clone[prop] = JSON.parse(JSON.stringify(list[prop]));
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
      fathom.trackGoal('AYCCVISE', 0);
      list.forks++;
      ListController.reset(clone);
    }
    clone.createdAt = list.createdAt;
    return clone;
  }

  public static reset(list: List): void {
    list.finalItems.forEach(recipe => ListController.resetDone(list, recipe));
    ListController.updateAllStatuses(list);
  }

  /**
   * Iterates on every item in the list, from recipes to crystals.
   * @param list
   * @param {(arg: ListRow) => void} method
   */
  public static forEach(list: List, method: (arg: ListRow) => void): void {
    list.items.forEach(method);
    list.finalItems.forEach(method);
  }

  /**
   * Iterates on recipes and preCrafts.
   * @param list
   * @param {(arg: ListRow) => void} method
   */
  public static forEachItemWithRequirement(list: List, method: (arg: ListRow) => void): void {
    (list.items || []).filter(row => row.requires !== undefined && row.requires.length > 0).forEach(method);
    (list.finalItems || []).filter(row => row.requires !== undefined && row.requires.length > 0).forEach(method);
  }

  public static getContributionStats(list: List, entries: ModificationEntry[], ilvls: LazyDataWithExtracts['ilvls']) {
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
        statsRow.ilvlAmount += entry.amount * ilvls[entry.itemId];
        stats.ilvlTotal += entry.amount * ilvls[entry.itemId];
        return stats;
      }, list.contributionStats);
  }

  public static addToFinalItems(list: List, data: ListRow): number {
    if (getItemSource(data, DataType.CRAFTED_BY).length === 0) {
      (data.requires || []).forEach(row => {
        let amount = row.amount * (data.amount_needed || data.amount);
        if (row.batches) {
          amount = Math.ceil(amount / row.batches) * row.batches;
        }
        ListController.add(list, list.items, {
          id: row.id,
          amount: amount,
          done: 0,
          used: 0,
          yield: 1,
          collectable: data.collectable
        });
      });
    }
    return ListController.add(list, list.finalItems, data, true);
  }

  /**
   * Merges the list with another one, used for list additions to me more efficient.
   * @param list
   * @param {List} otherList
   * @returns {List}
   */
  public static merge(list: List, otherList: List): List {
    otherList.items.forEach(item => {
      ListController.add(list, list.items, item);
    });
    otherList.finalItems.forEach(recipe => {
      ListController.add(list, list.finalItems, recipe, true);
    });
    return ListController.clean(list);
  }

  /**
   * Cleans the list, checking amounts and removing useless rows (with amount <= 0).
   * @returns {List}
   */
  public static clean(list: List): List {
    if (this.isEmpty(list)) {
      list.items = [];
      return list;
    }
    for (const prop of Object.keys(list)) {
      if (['finalItems', 'items'].indexOf(prop) > -1) {
        // We don't want to check the amount of items required for recipes, as they can't be wrong (provided by the user only).
        if (prop !== 'finalItems') {
          list[prop].forEach(row => {
            if (getItemSource(row, DataType.CRAFTED_BY).length === 0) {
              row.amount = row.amount_needed = ListController.totalAmountRequired(list, row);
            } else {
              row.amount = ListController.totalAmountRequired(list, row);
              row.amount_needed = Math.ceil(row.amount / row.yield);
            }
          });
        }
        list[prop] = list[prop].filter(row => row.amount > 0);
      }
    }
    return list;
  }

  public static isEmpty(list: List): boolean {
    return list.finalItems.length === 0;
  }

  public static requiredAsHQ(list: List, item: ListRow): number {
    if (list.disableHQSuggestions) {
      return 0;
    }
    if (!item || item.id < 20 || !syncHqFlags[item.id]) {
      return 0;
    }
    if (item.requiredAsHQ) {
      return item.amount;
    }
    const recipesNeedingItem = list.finalItems
      .filter(i => i.requires !== undefined)
      .filter(i => {
        return (i.requires || []).some(req => req.id === item.id);
      });
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

  public static getItemById(list: List, id: number | string, excludeFinalItems: boolean = false, onlyFinalItems = false, recipeId?: string): ListRow {
    let array = list.items.filter(i => !i.finalItem);
    if (!excludeFinalItems && !onlyFinalItems) {
      array = array.concat(list.finalItems);
    }
    if (onlyFinalItems) {
      array = list.finalItems;
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
   * @param list
   * @param {number} itemId
   * @param {number} amount
   * @param {boolean} setUsed
   * @param {boolean} excludeFinalItems
   * @param onlyFinalItems
   * @param recipeId
   * @param external
   * @param initialAddition
   */
  public static setDone(list: List, itemId: number | string, amount: number, excludeFinalItems = false, onlyFinalItems = false, setUsed = false, recipeId?: string, external = false, initialAddition = amount): void {
    const item = ListController.getItemById(list, itemId, excludeFinalItems, onlyFinalItems, recipeId);
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
    const newDone = item.amount_needed - MathTools.absoluteCeil((item.amount - item.done) / item.yield);
    amount = newDone - previousDone;
    if (item.requires !== undefined && newDone !== previousDone) {
      for (const requirement of item.requires) {
        const requirementItem = ListController.getItemById(list, requirement.id, excludeFinalItems);
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
            ListController.setDone(list, requirement.id, nextAmount, true, false, true, undefined, external, initialAddition);
          }
        }
      }
    }
  }

  public static canBeCrafted(list: List, item: ListRow): boolean {
    if (ListController.shouldIgnoreRequirements(list, 'items', item.id) || ListController.shouldIgnoreRequirements(list, 'finalItems', item.id)) {
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
      const requirementItem = ListController.getItemById(list, requirement.id, true);
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

  public static updateAllStatuses(list: List, updatedItemId?: number): void {
    const directRequirements = [...list.finalItems, ...list.items].filter(item => {
      return (item.requires || []).length > 0
        && (!updatedItemId || item.requires.some(req => req.id === updatedItemId));
    });
    directRequirements.forEach(item => {
      item.canBeCrafted = ListController.canBeCrafted(list, item);
      item.craftableAmount = ListController.craftableAmount(list, item);
    });
    list.finalItems.forEach(i => {
      i.hasAllBaseIngredients = (i.requires || []).length > 0 && !i.canBeCrafted && i.done < i.amount && ListController.hasAllBaseIngredients(list, i);
    });
    list.items.forEach(i => {
      i.hasAllBaseIngredients = (i.requires || []).length > 0 && !i.canBeCrafted && i.done < i.amount && ListController.hasAllBaseIngredients(list, i);
    });
  }

  public static craftableAmount(list: List, item: ListRow): number {
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
      canCraft = ListController.canBeCrafted(list, itemClone);
      if (canCraft) {
        amount++;
      }
    }
    return amount;
  }

  public static hasAllBaseIngredients(list: List, item: ListRow, amount = item.amount): boolean {
    // If it's not a craft, break recursion
    if (getItemSource(item, DataType.CRAFTED_BY).length === 0 || item.requires === undefined) {
      // Simply return the amount of the item being equal to the amount needed.
      return item.done >= amount;
    }
    // If we already have the precraft done, don't go further into the requirements.
    if (item.done >= amount || item.canBeCrafted) {
      return true;
    }
    // Don't mind crystals
    const requirements = item.requires.filter(req => req.id <= 1 || req.id > 20);
    return requirements.reduce((hasAllBaseIngredients, requirement) => {
      const requirementItem = ListController.getItemById(list, requirement.id, true);
      if (requirementItem !== undefined) {
        return ListController.hasAllBaseIngredients(list, requirementItem, requirement.amount * item.amount_needed) && hasAllBaseIngredients;
      }
    }, true);
  }

  /**
   * Checks if the list is outdated, the implementation is meant to change.
   * @returns {boolean}
   */
  public static isOutDated(list: List): boolean {
    if (ListController.isEmpty(list)) {
      return false;
    }
    let res = false;
    res = res || (list.version === undefined);
    res = res || semver.ltr(list.version, '6.1.0');
    return res;
  }

  public static resetDone(list: List, item: ListRow): void {
    if (!item) {
      return;
    }
    item.done = 0;
    item.used = 0;
    if (item.requires !== undefined) {
      item.requires.forEach(requirement => {
        const requirementItem = ListController.getItemById(list, requirement.id, true);
        ListController.resetDone(list, requirementItem);
      });
    }
  }

  public static addCraft(list: List, {
    _additions,
    customItems,
    dataService,
    listManager,
    lazyDataFacade,
    recipeId,
    gearsets
  }: CraftAdditionParams): Observable<List> {
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
              return ListController.addCustomCraft(list, addition, customItems, dataService, listManager);
            } else {
              return ListController.addNormalCraft(list, addition, listManager, lazyDataFacade, gearsets, recipeId, i === 0);
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
        return list;
      })
    );
  }

  public static isLarge(list: List): boolean {
    return list.items && list.items.length >= 100 || list.finalItems && list.finalItems.length > 50;
  }

  public static isTooLarge(list: List): boolean {
    return list.items.length + list.finalItems.length > 1000;
  }

  public static afterDeserialized(list: List): void {
    if (typeof list.createdAt !== 'object') {
      list.createdAt = firebase.firestore.Timestamp.fromDate(new Date(list.createdAt));
    } else if (!(list.createdAt instanceof firebase.firestore.Timestamp)) {
      list.createdAt = new firebase.firestore.Timestamp((list.createdAt as any).seconds, (list.createdAt as any).nanoseconds);
    }
    // lmao nice hotfix
    if (!list.name) {
      console.log('List has no name', list.$key);
    }
    if ((<any>list.name)?.name) {
      list.name = (<any>list.name).name;
    }
  }

  public static shouldIgnoreRequirements(list: List, array: 'items' | 'finalItems', itemId: number): boolean {
    return (list.ignoreRequirementsRegistry || {})[`${array}:${itemId}`] === 1;
  }

  public static setIgnoreRequirements(list: List, array: 'items' | 'finalItems', itemId: number, ignore: boolean): void {
    list.ignoreRequirementsRegistry = list.ignoreRequirementsRegistry || {};
    if (ignore) {
      list.ignoreRequirementsRegistry[`${array}:${itemId}`] = 1;
    } else {
      delete list.ignoreRequirementsRegistry[`${array}:${itemId}`];
    }
  }

  private static addNormalCraft(list: List, addition: CraftAddition, listManager: ListManagerService, lazyDataFacade: LazyDataFacade, gearsets: TeamcraftGearsetStats[], recipeId: string, finalItem: boolean): Observable<CraftAddition[]> {
    let craft: CraftedBy;
    const crafts = getItemSource(addition.item, DataType.CRAFTED_BY);
    if (recipeId !== undefined) {
      craft = crafts.find(c => c.id.toString() === recipeId.toString()) || crafts[0];
    } else {
      craft = getCraftByPriority(crafts, gearsets);
    }
    const ingredients$ = craft ? lazyDataFacade.getRecipes().pipe(map(recipes => recipes.find(r => r.id.toString() === craft.id.toString()).ingredients as Ingredient[])) : of(getItemSource(addition.item, DataType.REQUIREMENTS));

    return ingredients$.pipe(
      switchMap(ingredients => {
        if (ListController.shouldIgnoreRequirements(list, finalItem ? 'finalItems' : 'items', addition.item.id)) {
          return of([]);
        }
        return safeCombineLatest(ingredients.map(element => {
          return combineLatest([
            lazyDataFacade.getEntry('extracts'),
            lazyDataFacade.getRecipes() as unknown as Observable<Craft[]>
          ]).pipe(
            map(([extracts, recipes]) => {
              const elementDetails = extracts[element.id];
              const nextIteration: CraftAddition[] = [];
              if (element.id < 20 && element.id > 1) {
                ListController.add(list, list.items, {
                  id: +element.id,
                  amount: element.amount * addition.amount,
                  done: 0,
                  used: 0,
                  yield: 1,
                  collectable: false
                });
                listManager.addDetails(list);
                return [];
              } else {
                const craftedBy = getItemSource(elementDetails, DataType.CRAFTED_BY);
                const craftToAdd = getCraftByPriority(craftedBy, gearsets);
                if (elementDetails && getItemSource(elementDetails, DataType.CRAFTED_BY).length > 0) {
                  const yields = craftToAdd.yield || 1;
                  const added = ListController.add(list, list.items, {
                    id: elementDetails.id,
                    icon: elementDetails.icon,
                    amount: element.amount * addition.amount,
                    requires: recipes.find((r) => (r as any).result.toString() === element.id.toString()).ingredients,
                    done: 0,
                    used: 0,
                    yield: yields,
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
                    yield: 1
                  };
                  // Handle possible additional requirements
                  const requirements = getItemSource(elementDetails, DataType.REQUIREMENTS);
                  if (requirements.length > 0) {
                    rowToAdd.requires = requirements;
                    const reqAmount = element.amount * addition.amount;
                    requirements.forEach(req => {
                      const reqDetails = extracts[+req.id];
                      const reqRecipeId = getItemSource(reqDetails, DataType.CRAFTED_BY)[0]?.id;
                      ListController.add(list, list.items, {
                        id: +req.id,
                        amount: Math.ceil(reqAmount / req.amount) * req.amount,
                        done: 0,
                        used: 0,
                        yield: 1,
                        requires: reqRecipeId ? recipes.find((r) => (r as any).id.toString() === reqRecipeId.toString()).ingredients : getItemSource(reqDetails, DataType.REQUIREMENTS),
                        collectable: false
                      });
                      nextIteration.push({
                        item: extracts[+req.id],
                        amount: Math.ceil(reqAmount / req.amount) * req.amount
                      });
                    });
                  }
                  ListController.add(list, list.items, rowToAdd as ListRow);
                }
                listManager.addDetails(list);
              }
              return nextIteration;
            })
          );
        })).pipe(
          map(nextIteration => nextIteration.flat())
        );
      })
    );
  }

  private static addCustomCraft(list: List, addition: CraftAddition, customItems: CustomItem[], dataService: DataService, listManager: ListManagerService): Observable<CraftAddition[]> {
    const item: CustomItem = addition.data as CustomItem;
    const nextIteration: CraftAddition[] = [];
    let index = 0;
    const queue$ = new BehaviorSubject<Ingredient>(item.requires[0]);
    return queue$.pipe(
      switchMap(element => {
        if (element.id < 20 && element.id > 1) {
          ListController.add(list, list.items, {
            id: +element.id,
            amount: element.amount * addition.amount,
            done: 0,
            used: 0,
            yield: 1,
            collectable: false
          });
          listManager.addDetails(list);
          return of(null);
        } else {
          if (element.custom) {
            const itemDetails = customItems.find(i => i.$key === element.id);
            const itemDetailsClone = new CustomItem();
            Object.assign(itemDetailsClone, itemDetails);
            itemDetailsClone.amount = element.amount * addition.amount;
            itemDetailsClone.done = 0;
            itemDetailsClone.used = 0;
            itemDetailsClone.id = itemDetails.$key;
            const added = ListController.add(list, list.items, itemDetailsClone);
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
                  const added = ListController.add(list, list.items, {
                    id: elementDetails.id,
                    icon: elementDetails.icon,
                    amount: element.amount * addition.amount,
                    requires: elementDetails.craft[0].ingredients,
                    done: 0,
                    used: 0,
                    yield: yields,
                    collectable: false
                  });
                  return {
                    item: elementDetails,
                    data: elementItemData,
                    amount: added
                  };
                } else {
                  ListController.add(list, list.items, {
                    id: elementDetails.id,
                    icon: elementDetails.icon,
                    amount: element.amount * addition.amount,
                    done: 0,
                    used: 0,
                    yield: 1,
                    collectable: false
                  });
                }
                listManager.addDetails(list);
              })
            );
          }
        }
      }),
      tap((res) => {
        if (res !== null && res !== undefined) {
          nextIteration.push(res as CraftAddition);
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

  private static add(list: List, array: ListRow[], data: ListRow, recipe = false): number {
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
        ListController.setDone(list, row.id, row.amount_needed - previousDone, !recipe, recipe, false, data.recipeId);
      }
    }
    ListController.updateAllStatuses(list);
    return added;
  }

  /**
   * Gets the total amount needed for a given item based on requirements of the crafts in the list.
   * @param list
   * @param {ListRow} item
   * @returns {number}
   */
  private static totalAmountRequired(list: List, item: ListRow): number {
    if (ListController.getItemById(list, item.id) === undefined) {
      return 0;
    }
    let count = 0;
    ListController.forEachItemWithRequirement(list, craft => {
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
}
