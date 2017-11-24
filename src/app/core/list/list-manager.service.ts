import {Injectable} from '@angular/core';
import {List} from '../../model/list/list';
import {Observable} from 'rxjs/Observable';
import {ListRow} from '../../model/list/list-row';
import {DataService} from '../api/data.service';
import {GarlandToolsService} from 'app/core/api/garland-tools.service';
import {I18nToolsService} from '../tools/i18n-tools.service';
import {ItemData} from 'app/model/garland-tools/item-data';
import {environment} from '../../../environments/environment';
import 'rxjs/add/operator/debounceTime';
import {DataExtractorService} from './data/data-extractor.service';

@Injectable()
export class ListManagerService {

    constructor(protected db: DataService,
                private gt: GarlandToolsService,
                protected i18n: I18nToolsService,
                private extractor: DataExtractorService) {
    }

    public addToList(itemId: number, list: List, recipeId: string, amount = 1): Observable<List> {
        list.version = environment.version;
        return this.db.getItem(itemId)
            .map((data: ItemData) => {
                const crafted = this.extractor.extractCraftedBy(itemId, data);
                const addition = new List();
                const craft = data.getCraft(recipeId);
                // We have to remove unused ingredient properties.
                craft.ingredients.forEach(i => {
                    delete i.quality;
                    delete i.stepid;
                    delete i.part;
                    delete i.phase;
                });
                // Then we prepare the list row to add.
                const toAdd: ListRow = {
                    id: data.item.id,
                    icon: data.item.icon,
                    amount: amount,
                    done: 0,
                    yield: craft.yield || 1,
                    recipeId: recipeId,
                    requires: craft.ingredients,
                    craftedBy: crafted
                };
                // We add the row to recipes.
                const added = addition.addToRecipes(toAdd);
                // Then we add the craft to the addition list.
                addition.addCraft([{
                    item: data.item,
                    data: data,
                    amount: added
                }], this.gt, this.i18n);
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
                });
                // Return the addition for the next chain element.
                return addition;
            })
            // merge the addition list with the list we want to add items in.
            .map(addition => list.merge(addition))
            // Clear the result list, removing useless properties.
            .map(addition => addition.clean());
    }

    public upgradeList(list: List): Observable<List> {
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
        const add = [];
        list.recipes.forEach((recipe) => {
            add.push(this.addToList(recipe.id, list, recipe.recipeId, recipe.amount));
        });
        list.crystals = [];
        list.gathers = [];
        list.preCrafts = [];
        list.others = [];
        list.recipes = [];
        return Observable.combineLatest(...add, (...additions: List[]) => {
            // Because list is passed by reference, we can simply return the first one.
            return additions[0];
        }).map((resultList: List) => {
            backup.forEach(row => {
                const listRow = resultList[row.array].find(item => item.id === row.item.id);
                if (listRow !== undefined) {
                    if (row.item.comments !== undefined) {
                        listRow.comments = row.item.comments;
                    }
                    listRow.done = row.item.done;
                    if (row.array === 'recipes') {
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
            return resultList;
        });
    }
}
