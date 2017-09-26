import {Injectable} from '@angular/core';
import {List} from '../../model/list/list';
import {Observable} from 'rxjs';
import {ListRow} from '../../model/list/list-row';
import {DataService} from '../api/data.service';
import {I18nName} from '../../model/list/i18n-name';
import {GarlandToolsService} from 'app/core/api/garland-tools.service';
import {TradeSource} from '../../model/list/trade-source';
import {Instance} from 'app/model/list/instance';
import {Vendor} from '../../model/list/vendor';
import {HtmlToolsService} from '../html-tools.service';
import {I18nToolsService} from '../i18n-tools.service';
import {Craft} from '../../model/garland-tools/craft';
import {ItemData} from 'app/model/garland-tools/item-data';

@Injectable()
export class ListManagerService {

    constructor(protected db: DataService,
                private gt: GarlandToolsService,
                protected htmlTools: HtmlToolsService,
                protected i18n: I18nToolsService) {
    }

    public addToList(itemId: number, plist: List, recipeId: number, amount = 1): Observable<List> {
        return Observable
            .of(plist)
            .mergeMap(list => {
                return this.db.getItem(itemId)
                    .mergeMap((data: ItemData) => {
                        return data.item.getCraftedBy(this.htmlTools, this.db, this.gt, this.i18n)
                            .map(crafted => {
                                const craft = data.getCraft(recipeId);
                                const toAdd: ListRow = {
                                    id: data.item.id,
                                    name: this.i18n.createI18nName(data.item),
                                    icon: data.item.icon,
                                    amount: amount,
                                    done: 0,
                                    yield: craft.yield || 1,
                                    recipeId: recipeId,
                                    requires: craft.ingredients,
                                    craftedBy: crafted,
                                    addedAt: Date.now()
                                };
                                list.addToRecipes(toAdd);
                                return list.addCraft([{
                                    item: data.item,
                                    data: data,
                                    amount: amount
                                }], this.gt, this.i18n);
                            })
                            .mergeMap(l => {
                                const precrafts = [];
                                l.preCrafts.forEach(craft => {
                                    if (craft.craftedBy === undefined) {
                                        precrafts.push(data.getIngredient(craft.id)
                                            .getCraftedBy(this.htmlTools, this.db, this.gt, this.i18n));
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
                                        trades.push(related.getTradeSources(this.db, this.gt, this.i18n).map(ts => {
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
                                        vendors.push(related.getVendors(this.db, this.gt, this.i18n).map(ts => {
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
                            .mergeMap(l => {
                                const reductions: Observable<{ item: ListRow, reducedFrom: I18nName[] }>[] = [];
                                list.forEachItem(i => {
                                    const related = data.getIngredient(i.id);
                                    if (related !== undefined && related.reducedFrom !== undefined) {
                                        reductions.push(related.getReducedFrom(this.db, this.i18n).map(rs => {
                                            return {item: i, reducedFrom: rs};
                                        }));
                                    }
                                });
                                if (reductions.length > 0) {
                                    return Observable.combineLatest(...reductions, (...results) => {
                                        results.forEach(res => {
                                            res.item.reducedFrom = res.reducedFrom;
                                        });
                                        return l;
                                    });
                                } else {
                                    return Observable.of(l);
                                }
                            })
                            .mergeMap(l => {
                                const desynths: Observable<{ item: ListRow, desynths: I18nName[] }>[] = [];
                                list.forEachItem(i => {
                                    const related = data.getIngredient(i.id);
                                    if (related !== undefined && related.desynthedFrom !== undefined && related.desynthedFrom.length > 0) {
                                        desynths.push(related.getDesynths(this.db, this.i18n).map(rs => {
                                            return {item: i, desynths: rs};
                                        }));
                                    }
                                });
                                if (desynths.length > 0) {
                                    return Observable.combineLatest(...desynths, (...results) => {
                                        results.forEach(res => {
                                            res.item.desynths = res.desynths;
                                        });
                                        return l;
                                    });
                                } else {
                                    return Observable.of(l);
                                }
                            })
                            .map(l => {
                                l.forEachItem(o => {
                                    const related = data.getIngredient(o.id);
                                    if (related !== undefined && related.instances !== undefined) {
                                        const instances: Instance[] = [];
                                        related.instances.forEach(id => {
                                            const instance = this.gt.getInstance(id);
                                            instances.push(instance);
                                        });
                                        o.instances = instances;
                                    }
                                });
                                return l;
                            })
                            .map(l => {
                                l.gathers.forEach(g => {
                                    if (g.gatheredBy === undefined) {
                                        g.gatheredBy = data.getIngredient(g.id).getGatheredBy(this.gt, this.htmlTools);
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
                                    if (related !== undefined && related.drops !== undefined) {
                                        related.drops.forEach(d => {
                                            if (o.drops === undefined) {
                                                o.drops = [];
                                            }
                                            const drop = this.gt.getDrop(d);
                                            if (drop !== undefined) {
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
            });
    }

    public upgradeList(list: List): Observable<List> {
        const add = [];
        list.recipes.forEach((recipe) => {
            add.push(this.addToList(recipe.id, list, recipe.recipeId, recipe.amount));
        });
        list.crystals = [];
        list.gathers = [];
        list.preCrafts = [];
        list.others = [];
        return Observable.concat(...add);
    }
}
