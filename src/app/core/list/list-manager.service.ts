import {Injectable} from '@angular/core';
import {List} from '../../model/list/list';
import {Observable} from 'rxjs';
import {ListRow} from '../../model/list/list-row';
import {DataService} from '../api/data.service';
import {GarlandToolsService} from 'app/core/api/garland-tools.service';
import {TradeSource} from '../../model/list/trade-source';
import {Instance} from 'app/model/list/instance';
import {Vendor} from '../../model/list/vendor';
import {HtmlToolsService} from '../html-tools.service';
import {I18nToolsService} from '../i18n-tools.service';
import {Craft} from '../../model/garland-tools/craft';
import {ItemData} from 'app/model/garland-tools/item-data';
import {environment} from '../../../environments/environment';
import {Drop} from '../../model/list/drop';
import {LocalizedDataService} from '../data/localized-data.service';

@Injectable()
export class ListManagerService {

    constructor(protected db: DataService,
                private gt: GarlandToolsService,
                protected htmlTools: HtmlToolsService,
                protected i18n: I18nToolsService,
                private localized: LocalizedDataService) {
    }

    public addToList(itemId: number, list: List, recipeId: string, amount = 1): Observable<List> {
        list.version = environment.version;
        return this.db.getItem(itemId)
            .mergeMap((data: ItemData) => {
                return data.item.getCraftedBy(this.htmlTools, this.db, this.gt)
                    .map(crafted => {
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
                        const added = list.addToRecipes(toAdd);
                        return list.addCraft([{
                            item: data.item,
                            data: data,
                            amount: added
                        }], this.gt, this.i18n);
                    })
                    .mergeMap(l => {
                        const precrafts = [];
                        l.preCrafts.forEach(craft => {
                            if (craft.craftedBy === undefined) {
                                precrafts.push(data.getIngredient(craft.id)
                                    .getCraftedBy(this.htmlTools, this.db, this.gt));
                            }
                        });
                        if (precrafts.length > 0) {
                            return Observable.combineLatest(...precrafts, (...details: Craft[]) => {
                                const crafts = [].concat.apply([], details);
                                l.preCrafts.forEach(craft => {
                                    if (craft.craftedBy === undefined) {
                                        craft.craftedBy = crafts.filter(c => c.itemId === craft.id);
                                    }
                                });
                                return l;
                            });
                        }
                        return Observable.of(l);
                    })
                    .mergeMap(l => {
                        const trades: Observable<{ item: ListRow, tradeSources: TradeSource[] }>[] = [];
                        list.forEachItem(item => {
                            const related = data.getIngredient(item.id);
                            if (related !== undefined && related.tradeSources !== undefined) {
                                trades.push(related.getTradeSources(this.db).map(ts => {
                                    return {item: item, tradeSources: ts};
                                }));
                            }
                        });
                        if (trades.length > 0) {
                            return Observable.combineLatest(...trades, (...ptrades) => {
                                ptrades.forEach(ptrade => {
                                    ptrade.item.tradeSources = ptrade.tradeSources;
                                });
                                return l;
                            });
                        } else {
                            return Observable.of(l);
                        }
                    })
                    .mergeMap(l => {
                        const vendors: Observable<{ item: ListRow, vendors: Vendor[] }>[] = [];
                        list.forEachItem(item => {
                            const related = data.getIngredient(item.id);
                            if (related !== undefined && related.vendors !== undefined) {
                                vendors.push(related.getVendors(this.db).map(ts => {
                                    return {item: item, vendors: ts};
                                }));
                            }
                        });
                        if (vendors.length > 0) {
                            return Observable.combineLatest(...vendors, (...pvendors) => {
                                pvendors.forEach(v => {
                                    v.item.vendors = v.vendors;
                                });
                                return l;
                            });
                        } else {
                            return Observable.of(l);
                        }
                    })
                    .map(l => {
                        l.forEachItem(i => {
                            const related = data.getIngredient(i.id);
                            if (related !== undefined && related.reducedFrom !== undefined) {
                                i.reducedFrom = related.getReducedFrom();
                            }
                        });
                        return l;
                    })
                    .map(l => {
                        list.forEachItem(i => {
                            const related = data.getIngredient(i.id);
                            if (related !== undefined && related.desynthedFrom !== undefined && related.desynthedFrom.length > 0) {
                                i.desynths = related.getDesynths();
                            }
                        });
                        return l;
                    })
                    .map(l => {
                        l.forEachItem(o => {
                            const related = data.getIngredient(o.id);
                            if (related !== undefined && related.instances !== undefined) {
                                const instances: Instance[] = [];
                                related.instances.forEach(id => {
                                    const instance = data.getInstance(id);
                                    if (instance !== undefined) {
                                        instances.push(instance);
                                    }
                                });
                                o.instances = instances;
                            }
                        });
                        return l;
                    })
                    .map(l => {
                        l.gathers.forEach(g => {
                            if (g.gatheredBy === undefined) {
                                g.gatheredBy = data.getIngredient(g.id).getGatheredBy(this.gt, this.htmlTools, data, this.localized);
                            }
                        });
                        return l;
                    })
                    .map(l => {
                        l.forEachItem(o => {
                            const related = data.getIngredient(o.id);
                            if (related !== undefined && related.seeds !== undefined) {
                                o.gardening = true;
                            }
                        });
                        return l;
                    })
                    .map(l => {
                        l.forEachItem(o => {
                            const related = data.getIngredient(o.id);
                            if (related !== undefined && related.voyages !== undefined) {
                                o.voyages = related.getVoyages();
                            }
                        });
                        return l;
                    })
                    .map(l => {
                        l.forEachItem(o => {
                            const related = data.getIngredient(o.id);
                            if (related !== undefined && related.drops !== undefined) {
                                related.drops.forEach(d => {
                                    if (o.drops === undefined) {
                                        o.drops = [];
                                    }
                                    const partial = data.getPartial(d.toString(), 'mob');
                                    if (partial !== undefined) {
                                        const drop: Drop = {
                                            id: d,
                                            zoneid: partial.obj.z,
                                            lvl: partial.obj.l
                                        };
                                        o.drops.push(drop);
                                    }
                                });
                            }
                        });
                        return l;
                    });
            })
            .map(l => l.clean())
            .debounceTime(500);
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
        let done = 0;
        return Observable.concat(...add)
            .map((resultList: List) => {
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
            })
            .do(() => done++)
            .filter(() => done === add.length);
    }
}
