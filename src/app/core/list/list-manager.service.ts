import {Injectable} from '@angular/core';
import {List} from '../../model/list/list';
import {Observable} from 'rxjs';
import {ListRow} from '../../model/list/list-row';
import {DataService} from '../api/data.service';
import {CraftedBy} from '../../model/list/crafted-by';
import {I18nName} from '../../model/list/i18n-name';
import {GarlandToolsService} from 'app/core/api/garland-tools.service';
import {CraftAddition} from '../../model/list/craft-addition';
import {TradeSource} from '../../model/list/trade-source';
import {Trade} from '../../model/list/trade';
import {Instance} from 'app/model/list/instance';
import {Vendor} from '../../model/list/vendor';
import {HtmlToolsService} from '../html-tools.service';
import {I18nToolsService} from '../i18n-tools.service';
import {Item} from '../../model/garland-tools/item';
import {Craft} from '../../model/garland-tools/craft';
import {ItemData} from 'app/model/garland-tools/item-data';

@Injectable()
export class ListManagerService {

    constructor(protected db: DataService,
                private gt: GarlandToolsService,
                protected htmlTools: HtmlToolsService,
                protected i18n: I18nToolsService) {
    }

    public getCraftedBy(item: Item): Observable<CraftedBy[]> {
        if (!item.isCraft()) {
            return Observable.of([]);
        }
        const result = [];
        for (const craft of item.craft) {
            const craftedBy: CraftedBy = {
                itemId: item.id,
                icon: `https://secure.xivdb.com/img/classes/set2/${this.gt.getJob(craft.job).name.toLowerCase()}.png`,
                level: craft.lvl,
                stars_tooltip: this.htmlTools.generateStars(craft.stars)
            };
            if (craft.job === 0) {
                craftedBy.icon = '';
            }
            if (craft.unlockId !== undefined) {
                result.push(this.db.getItem(craft.unlockId).map(masterbook => {
                    craftedBy.masterbook = {
                        name: this.i18n.createI18nName(masterbook.item),
                        id: masterbook.item.id
                    };
                    return craftedBy;
                }));
            } else {
                result.push(Observable.of(craftedBy));
            }
        }
        return Observable.combineLatest(result);
    }

    protected getTradeSources(item: Item): Observable<TradeSource[]> {
        const tradeSources: Observable<TradeSource> [] = [];
        for (const ts of Object.keys(item.tradeSources)) {
            const tradeObs = Observable
                .of({
                    npcName: '',
                    zoneName: {fr: '', de: '', en: '', ja: ''}
                })
                .mergeMap((tradeSource: TradeSource) => {
                    return this.db.getNpc(+ts)
                        .map(data => {
                            tradeSource.npcName = data.npc.name;
                            if (data.npc.zoneid === undefined) {
                                return undefined;
                            }
                            tradeSource.zoneName = this.gt.getLocation(data.npc.zoneid).name;
                            return tradeSource as TradeSource;
                        });
                })
                .mergeMap((tradeSource: TradeSource) => {
                    const trades: Observable<Trade>[] = [];
                    for (const row of item.tradeSources[ts]) {
                        const obs: Observable<Trade> = Observable
                            .of({
                                itemIcon: '',
                                itemAmount: 0,
                                currencyIcon: '',
                                currencyAmount: 0,
                                itemHQ: false
                            })
                            .mergeMap(trade => {
                                return this.db.getItem(+row.item[0].id)
                                    .map(data => {
                                        trade.itemIcon = data.item.icon;
                                        trade.itemAmount = row.item[0].amount;
                                        trade.itemHQ = row.item[0].hq === 1;
                                        return trade;
                                    });
                            })
                            .mergeMap(trade => {
                                return this.db.getItem(+row.currency[0].id)
                                    .map(data => {
                                        trade.currencyIcon = data.item.icon;
                                        trade.currencyAmount = row.currency[0].amount;
                                        return trade;
                                    });
                            });
                        trades.push(obs);
                    }
                    return Observable.combineLatest(...trades, (...ptrades: Trade[]) => {
                        if (tradeSource === undefined) {
                            return undefined;
                        }
                        tradeSource.trades = ptrades;
                        return tradeSource;
                    });
                });
            tradeSources.push(tradeObs);
        }
        return Observable.combineLatest(...tradeSources, (...ts) => {
            return ts.filter(t => t !== undefined);
        });
    }

    protected getVendors(item: Item): Observable<Vendor[]> {
        const vendors: Observable<Vendor> [] = [];
        for (const id of item.vendors) {
            const vendorObs: Observable<Vendor> = Observable
                .of({
                    npcName: '',
                    zoneName: {fr: '', de: '', en: '', ja: ''}
                }).mergeMap((vendor: Vendor) => {
                    return this.db.getNpc(+id)
                        .map(data => {
                            vendor.npcName = data.npc.name;
                            if (data.npc.zoneid === undefined) {
                                return undefined;
                            }
                            vendor.zoneName = this.gt.getLocation(data.npc.zoneid).name;
                            const tradeInfo = data.partials.find(o => o.obj.i === item.id);
                            vendor.price = tradeInfo.obj.p;
                            if (data.npc.coords !== undefined) {
                                vendor.coords = {
                                    x: data.npc.coords[0],
                                    y: data.npc.coords[1]
                                };
                            }
                            return vendor as Vendor;
                        });
                });
            vendors.push(vendorObs);
        }
        return Observable.combineLatest(...vendors, (...vs) => {
            return vs.filter(v => v !== undefined);
        });
    }

    protected getReducedFrom(item: Item): Observable<I18nName[]> {
        const reductions: Observable<I18nName> [] = [];
        for (const id of item.reducedFrom) {
            const reductionObs = Observable
                .of({fr: '', de: '', en: '', ja: ''})
                .mergeMap((name: I18nName) => {
                    return this.db.getItem(id).map(data => {
                        name = this.i18n.createI18nName(data.item);
                        return name;
                    });
                });
            reductions.push(reductionObs);
        }
        return Observable.combineLatest(reductions);
    }

    protected getDesynths(item: Item): Observable<I18nName[]> {
        const desynths: Observable<I18nName> [] = [];
        for (const id of item.desynthedFrom) {
            const desynthObs = Observable
                .of({fr: '', de: '', en: '', ja: ''})
                .mergeMap((name: I18nName) => {
                    return this.db.getItem(id).map(data => {
                        name = this.i18n.createI18nName(data.item);
                        return name;
                    });
                });
            desynths.push(desynthObs);
        }
        return Observable.combineLatest(desynths);
    }

    public addToList(itemId: number, plist: List, recipeId: number, amount = 1): Observable<List> {
        return Observable
            .of(plist)
            .mergeMap(list => {
                return this.db.getItem(itemId)
                    .mergeMap((data: ItemData) => {
                        return this.getCraftedBy(data.item)
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
                                return this.addCraft([{item: data.item, data: data, amount: Math.ceil(amount / toAdd.yield)}], list);
                            })
                            .mergeMap(l => {
                                const precrafts = [];
                                l.preCrafts.forEach(craft => {
                                    if (craft.craftedBy === undefined) {
                                        precrafts.push(this.getCraftedBy(data.getRelated(craft.id)));
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
                                    const related = data.getRelated(item.id);
                                    if (related !== undefined && related.tradeSources !== undefined) {
                                        trades.push(this.getTradeSources(related).map(ts => {
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
                                    const related = data.getRelated(item.id);
                                    if (related !== undefined && related.vendors !== undefined) {
                                        vendors.push(this.getVendors(related).map(ts => {
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
                                    const related = data.getRelated(i.id);
                                    if (related !== undefined && related.reducedFrom !== undefined) {
                                        reductions.push(this.getReducedFrom(related).map(rs => {
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
                                    const related = data.getRelated(i.id);
                                    if (related !== undefined && related.desynthedFrom !== undefined && related.desynthedFrom.length > 0) {
                                        desynths.push(this.getDesynths(related).map(rs => {
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
                                    const related = data.getRelated(o.id);
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
                                        g.gatheredBy = data.getRelated(g.id).getGatheredBy(this.gt, this.htmlTools);
                                    }
                                });
                                return l;
                            })
                            .map(l => {
                                l.forEachItem(o => {
                                    const related = data.getRelated(o.id);
                                    if (related !== undefined && related.seeds !== undefined) {
                                        o.gardening = true;
                                    }
                                });
                                return l;
                            })
                            .map(l => {
                                l.forEachItem(o => {
                                    const related = data.getRelated(o.id);
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

    protected addCraft(additions: CraftAddition[], list: List): List {
        const nextIteration: CraftAddition[] = [];
        for (const addition of additions) {
            for (const element of addition.item.craft[0].ingredients) {
                // If this is a crystal
                if (element.id < 20 && element.id > 1) {
                    const crystal = this.gt.getCrystalDetails(element.id);
                    list.addToCrystals({
                        id: element.id,
                        name: this.i18n.createI18nName(crystal),
                        icon: crystal.icon,
                        amount: element.amount * addition.amount,
                        done: 0,
                        yield: 1,
                        addedAt: Date.now()
                    });
                } else {
                    const elementDetails = addition.data.getRelated(element.id);
                    if (elementDetails.isCraft()) {
                        const yields = elementDetails.craft[0].yield || 1;
                        const amount = Math.ceil(element.amount * addition.amount / yields);
                        list.addToPreCrafts({
                            id: elementDetails.id,
                            icon: elementDetails.icon,
                            amount: amount,
                            requires: elementDetails.craft[0].ingredients,
                            done: 0,
                            name: this.i18n.createI18nName(elementDetails),
                            yield: yields,
                            addedAt: Date.now()
                        });
                        nextIteration.push({
                            item: elementDetails,
                            data: addition.data,
                            amount: amount
                        });
                    } else if (elementDetails.hasNodes() || elementDetails.hasFishingSpots()) {
                        list.addToGathers({
                            id: elementDetails.id,
                            icon: elementDetails.icon,
                            amount: element.amount * addition.amount,
                            done: 0,
                            name: this.i18n.createI18nName(elementDetails),
                            yield: 1,
                            addedAt: Date.now()
                        });
                    } else {
                        list.addToOthers({
                            id: elementDetails.id,
                            icon: elementDetails.icon,
                            amount: element.amount * addition.amount,
                            done: 0,
                            name: this.i18n.createI18nName(elementDetails),
                            yield: 1,
                            addedAt: Date.now()
                        });
                    }
                }
            }
        }
        if (nextIteration.length > 0) {
            return this.addCraft(nextIteration, list);
        }
        return list;
    }
}
