import {Injectable, NgZone} from '@angular/core';
import {List} from '../../model/list/list';
import {concat, Observable} from 'rxjs';
import {ListRow} from '../../model/list/list-row';
import {DataService} from '../api/data.service';
import {GarlandToolsService} from 'app/core/api/garland-tools.service';
import {I18nToolsService} from '../tools/i18n-tools.service';
import {ItemData} from 'app/model/garland-tools/item-data';
import {environment} from '../../../environments/environment';


import {Ingredient} from '../../model/garland-tools/ingredient';
import {DataExtractorService} from './data/data-extractor.service';
import {map, skip} from 'rxjs/operators';

@Injectable()
export class ListManagerService {

    constructor(protected db: DataService,
                private gt: GarlandToolsService,
                protected i18n: I18nToolsService,
                private extractor: DataExtractorService,
                private zone: NgZone) {
    }

    public addToList(itemId: number, list: List, recipeId: string, amount = 1, collectible = false): Observable<List> {
        list.version = environment.version;
        return this.db.getItem(itemId)
            .pipe(
                map((data: ItemData) => {
                    const crafted = this.extractor.extractCraftedBy(+itemId, data);
                    const addition = new List();
                    let toAdd: ListRow;

                    // If this is a craft
                    if (data.isCraft()) {
                        const craft = data.getCraft(recipeId);
                        const ingredients: Ingredient[] = [];
                        // We have to remove unused ingredient properties.
                        craft.ingredients.forEach(i => {
                            delete i.quality;
                            delete i.stepid;
                            delete i.part;
                            delete i.phase;
                        });
                        craft.ingredients.forEach(req => {
                            const requirementsRow = ingredients.find(row => row.id === req.id);
                            if (requirementsRow === undefined) {
                                ingredients.push(req);
                            } else {
                                requirementsRow.amount += req.amount;
                            }
                        });
                        const yields = collectible ? 1 : (craft.yield || 1);
                        // Then we prepare the list row to add.
                        toAdd = {
                            id: data.item.id,
                            icon: data.item.icon,
                            amount: amount,
                            done: 0,
                            used: 0,
                            yield: yields,
                            recipeId: recipeId,
                            requires: ingredients,
                            craftedBy: crafted
                        };
                    } else {
                        // If it's not a recipe, add as item
                        toAdd = {
                            id: data.item.id,
                            icon: data.item.icon,
                            amount: amount,
                            done: 0,
                            used: 0,
                            yield: 1,
                        };
                    }
                    // We add the row to recipes.
                    const added = addition.addToItems(toAdd);

                    if (data.isCraft()) {
                        // Then we add the craft to the addition list.
                        addition.addCraft([{
                            item: data.item,
                            data: data,
                            amount: added
                        }], this.gt, this.i18n, recipeId);
                    }
                    // Process items to add details.
                    addition.recipes.forEach(item => {
                        item.craftedBy = this.extractor.extractCraftedBy(item.id, data);
                        item.vendors = this.extractor.extractVendors(item.id, data);
                        item.tradeSources = this.extractor.extractTradeSources(item.id, data);
                        item.reducedFrom = this.extractor.extractReducedFrom(item.id, data);
                        item.desynths = this.extractor.extractDesynths(item.id, data);
                        item.instances = this.extractor.extractInstances(item.id, data);
                        item.gardening = this.extractor.extractGardening(item.id, data);
                        item.voyages = this.extractor.extractVoyages(item.id, data);
                        item.drops = this.extractor.extractDrops(item.id, data);
                        item.ventures = this.extractor.extractVentures(item.id, data);
                        item.gatheredBy = this.extractor.extractGatheredBy(item.id, data);
                    });
                    // Process precrafts to add crafter details.
                    addition.preCrafts.forEach(preCraft => {
                        preCraft.craftedBy = this.extractor.extractCraftedBy(preCraft.id, data);
                    });
                    // Process details for gathered items.
                    addition.gathers.forEach(g => {
                        if (g.gatheredBy === undefined) {
                            g.gatheredBy = this.extractor.extractGatheredBy(g.id, data);
                        }
                    });
                    // Process details for each other item.
                    addition.forEachItem(i => {
                        i.vendors = this.extractor.extractVendors(i.id, data);
                        i.tradeSources = this.extractor.extractTradeSources(i.id, data);
                        i.reducedFrom = this.extractor.extractReducedFrom(i.id, data);
                        i.desynths = this.extractor.extractDesynths(i.id, data);
                        i.instances = this.extractor.extractInstances(i.id, data);
                        i.gardening = this.extractor.extractGardening(i.id, data);
                        i.voyages = this.extractor.extractVoyages(i.id, data);
                        i.drops = this.extractor.extractDrops(i.id, data);
                        i.ventures = this.extractor.extractVentures(i.id, data);
                    });
                    // Return the addition for the next chain element.
                    return addition;
                }),
                // merge the addition list with the list we want to add items in.
                map(addition => list.merge(addition))
            );
    }

    public upgradeList(list: List): Observable<List> {
        return this.zone.runOutsideAngular(() => {
            const permissions = list.permissionsRegistry;
            const backup = [];
            list.crystals.forEach(item => {
                backup.push({array: 'crystals', item: item});
            });
            list.gathers.forEach(item => {
                backup.push({array: 'gathers', item: item});
            });
            list.preCrafts.forEach(item => {
                backup.push({array: 'preCrafts', item: item});
            });
            list.others.forEach(item => {
                backup.push({array: 'others', item: item});
            });
            list.recipes.forEach(item => {
                backup.push({array: 'recipes', item: item});
            });
            const add: Observable<List>[] = [];
            list.recipes.forEach((recipe) => {
                add.push(this.addToList(recipe.id, list, recipe.recipeId, recipe.amount));
            });
            list.crystals = [];
            list.gathers = [];
            list.preCrafts = [];
            list.others = [];
            list.recipes = [];
            return concat(...add)
                .pipe(
                    // Only apply backup at last iteration, to avoid unnecessary slow process.
                    skip(add.length - 1),
                    map((resultList: List) => {
                        backup.forEach(row => {
                            const listRow = resultList[row.array].find(item => item.id === row.item.id);
                            if (listRow !== undefined) {
                                if (row.item.comments !== undefined) {
                                    listRow.comments = row.item.comments;
                                }
                                listRow.done = row.item.done;
                                listRow.used = row.item.used || 0;
                                if (row.item.craftedBy !== undefined && row.item.craftedBy.length > 0) {
                                    if (listRow.done > listRow.amount) {
                                        listRow.done = listRow.amount;
                                    }
                                } else {
                                    if (listRow.done > listRow.amount_needed) {
                                        listRow.done = listRow.amount_needed;
                                    }
                                }
                            }
                        });
                        resultList.permissionsRegistry = permissions;
                        return resultList;
                    })
                );
        });
    }
}
