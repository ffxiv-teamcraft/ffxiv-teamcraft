import {Injectable} from '@angular/core';
import {List} from '../../model/list/list';
import {Observable} from 'rxjs/Observable';
import {ListRow} from '../../model/list/list-row';
import {DataService} from '../api/data.service';
import {GarlandToolsService} from 'app/core/api/garland-tools.service';
import {TradeSource} from '../../model/list/trade-source';
import {Vendor} from '../../model/list/vendor';
import {I18nToolsService} from '../tools/i18n-tools.service';
import {Craft} from '../../model/garland-tools/craft';
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
            .switchMap((data: ItemData) => {
                return this.extractor.extractCraftedBy(itemId, data)
                    .map(crafted => {
                        const addition = new List();
                        const craft = data.getCraft(recipeId);
                        // We have to remove unused ingredient properties.
                        craft.ingredients.forEach(i => {
                            delete i.quality;
                            delete i.stepid;
                            delete i.part;
                            delete i.phase;
                        });
                        const toAdd: ListRow = {
                            id: data.item.id,
                            icon: data.item.icon,
                            amount: amount,
                            done: 0,
                            yield: craft.yield || 1,
                            recipeId: recipeId,
                            requires: craft.ingredients,
                            craftedBy: crafted,
                            addedAt: Date.now()
                        };
                        const added = addition.addToRecipes(toAdd);
                        return addition.addCraft([{
                            item: data.item,
                            data: data,
                            amount: added
                        }], this.gt, this.i18n);
                    })
                    .switchMap(addition => {
                        const precrafts = [];
                        addition.preCrafts.forEach(craft => {
                            if (craft.craftedBy === undefined) {
                                precrafts.push(this.extractor.extractCraftedBy(craft.id, data));
                            }
                        });
                        if (precrafts.length > 0) {
                            return Observable.combineLatest(...precrafts, (...details: Craft[]) => {
                                const crafts = [].concat.apply([], details);
                                addition.preCrafts.forEach(craft => {
                                    if (craft.craftedBy === undefined) {
                                        craft.craftedBy = crafts.filter(c => c.itemId === craft.id);
                                    }
                                });
                                return addition;
                            });
                        }
                        return Observable.of(addition);
                    })
                    .switchMap(addition => {
                        const trades: Observable<{ item: ListRow, tradeSources: TradeSource[] }>[] = [];
                        addition.forEachItem(item => {
                            trades.push(this.extractor.extractTradeSources(item.id, data)
                                .map(ts => {
                                    return {item: item, tradeSources: ts};
                                }));
                        });
                        if (trades.length > 0) {
                            return Observable.combineLatest(...trades, (...ptrades) => {
                                ptrades.forEach(ptrade => {
                                    if (ptrade.tradeSources !== null) {
                                        ptrade.item.tradeSources = ptrade.tradeSources;
                                    }
                                });
                                return addition;
                            });
                        } else {
                            return Observable.of(addition);
                        }
                    })
                    .switchMap(addition => {
                        const vendors: Observable<{ item: ListRow, vendors: Vendor[] }>[] = [];
                        addition.forEachItem(item => {
                            vendors.push(this.extractor.extractVendors(item.id, data).map(ts => {
                                return {item: item, vendors: ts};
                            }));
                        });
                        if (vendors.length > 0) {
                            return Observable.combineLatest(...vendors, (...pvendors) => {
                                pvendors.forEach(v => {
                                    if (v.vendors !== null) {
                                        v.item.vendors = v.vendors;
                                    }
                                });
                                return addition;
                            });
                        } else {
                            return Observable.of(addition);
                        }
                    })
                    .map(addition => {
                        addition.forEachItem(i => {
                            i.reducedFrom = this.extractor.extractReducedFrom(i.id, data);
                            i.desynths = this.extractor.extractDesynths(i.id, data);
                            i.instances = this.extractor.extractInstances(i.id, data);
                            i.gardening = this.extractor.extractGardening(i.id, data);
                            i.voyages = this.extractor.extractVoyages(i.id, data);
                            i.drops = this.extractor.extractDrops(i.id, data);
                        });
                        return addition;
                    })
                    .map(addition => {
                        addition.gathers.forEach(g => {
                            if (g.gatheredBy === undefined) {
                                g.gatheredBy = this.extractor.extractGatheredBy(g.id, data);
                            }
                        });
                        return addition;
                    })
            })
            .map(addition => addition.clean())
            .map(addition => list.merge(addition));
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
        const start = Date.now();
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
        }).do(() => console.log(`Regeneration took ${Date.now() - start}ms`));
    }
}
