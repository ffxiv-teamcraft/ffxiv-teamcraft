import {Injectable} from '@angular/core';
import {List} from '../../model/list';
import {Observable} from 'rxjs';
import {ListRow} from '../../model/list-row';
import {DataService} from '../api/data.service';
import {CraftedBy} from '../../model/crafted-by';
import {I18nName} from '../../model/i18n-name';
import {GarlandToolsService} from 'app/core/api/garland-tools.service';
import {CraftAddition} from '../../model/craft-addition';
import {GatheredBy} from '../../model/gathered-by';
import {TradeSource} from '../../model/trade-source';
import {Trade} from '../../model/trade';
import {Instance} from 'app/model/instance';
import {Vendor} from '../../model/vendor';
import {HtmlToolsService} from '../html-tools.service';
import {I18nToolsService} from '../i18n-tools.service';

@Injectable()
export class ListManagerService {

    constructor(protected db: DataService,
                private gt: GarlandToolsService,
                protected htmlTools: HtmlToolsService,
                protected i18n: I18nToolsService) {
    }

    public getCraftedBy(item: any): Observable<CraftedBy[]> {
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

    protected getGatheredBy(item: any): GatheredBy {
        const gatheredBy: GatheredBy = {
            icon: '',
            stars_tooltip: '',
            level: 0,
            nodes: []
        };
        // If it's a node gather (not a fish)
        if (item.nodes !== undefined) {
            for (const node of item.nodes) {
                const details = this.gt.getNode(node);
                if (details.type <= 1) {
                    gatheredBy.icon = 'https://garlandtools.org/db/images/MIN.png';
                } else if (details.type < 4) {
                    gatheredBy.icon = 'https://garlandtools.org/db/images/BTN.png';
                } else {
                    gatheredBy.icon = 'https://garlandtools.org/db/images/FSH.png';
                }
                gatheredBy.stars_tooltip = this.htmlTools.generateStars(details.stars);
                gatheredBy.level = details.lvl;
                if (details.areaid !== undefined) {
                    gatheredBy.nodes.push(details);
                }
            }
        } else {
            // If it's a fish, we have to handle it in another way
            for (const spot of item.fishingSpots) {
                const details = this.gt.getFishingSpot(spot);
                gatheredBy.icon = 'https://garlandtools.org/db/images/FSH.png';
                if (details.areaid !== undefined) {
                    gatheredBy.nodes.push(details);
                }
                gatheredBy.level = details.lvl;
            }
        }
        return gatheredBy;
    }

    protected getTradeSources(item: any): Observable<TradeSource[]> {
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
                                itemIcon: 0,
                                itemAmount: 0,
                                currencyIcon: 0,
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

    protected getVendors(item: any): Observable<Vendor[]> {
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

    protected getReducedFrom(item: any): Observable<I18nName[]> {
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

    protected getDesynths(item: any): Observable<I18nName[]> {
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

    protected getCraft(item: any, recipeId: number): any {
        return item.craft.find(i => i.id === recipeId);
    }

    public addToList(itemId: number, plist: List, recipeId: number, amount = 1): Observable<List> {
        return Observable
            .of(plist)
            .mergeMap(list => {
                return this.db.getItem(itemId)
                    .mergeMap(data => {
                        return this.getCraftedBy(data.item)
                            .map(crafted => {
                                const craft = this.getCraft(data.item, recipeId);
                                const toAdd: ListRow = {
                                    id: data.item.id,
                                    name: this.i18n.createI18nName(data.item),
                                    icon: this.getIcon(data.item),
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
                                        precrafts.push(this.getCraftedBy(this.getRelated(data, craft.id)));
                                    }
                                });
                                if (precrafts.length > 0) {
                                    return Observable.combineLatest(...precrafts, (...details: any[]) => {
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
                                const trades: Observable<{ item: any, tradeSources: TradeSource[] }>[] = [];
                                list.forEachItem(item => {
                                    const related = this.getRelated(data, item.id);
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
                                const vendors: Observable<{ item: any, vendors: Vendor[] }>[] = [];
                                list.forEachItem(item => {
                                    const related = this.getRelated(data, item.id);
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
                                const reductions: Observable<{ item: any, reducedFrom: I18nName[] }>[] = [];
                                list.forEachItem(i => {
                                    const related = this.getRelated(data, i.id);
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
                                const desynths: Observable<{ item: any, desynths: I18nName[] }>[] = [];
                                list.forEachItem(i => {
                                    const related = this.getRelated(data, i.id);
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
                                    const related = this.getRelated(data, o.id);
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
                                        g.gatheredBy = this.getGatheredBy(this.getRelated(data, g.id));
                                    }
                                });
                                return l;
                            })
                            .map(l => {
                                l.forEachItem(o => {
                                    const related = this.getRelated(data, o.id);
                                    if (related !== undefined && related.seed !== undefined) {
                                        o.gardening = true;
                                    }
                                });
                                return l;
                            })
                            .map(l => {
                                l.forEachItem(o => {
                                    const related = this.getRelated(data, o.id);
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

    protected getRelated(data: any, id: number): any {
        return data.related.find(item => {
            return item.id === id;
        });
    }

    protected getIcon(item: any): string {
        return `https://www.garlandtools.org/db/icons/item/${item.icon}.png`;
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
                        icon: this.getIcon(crystal),
                        amount: element.amount * addition.amount,
                        done: 0,
                        yield: 1,
                        addedAt: Date.now()
                    });
                } else {
                    const elementDetails = this.getRelated(addition.data, element.id);
                    if (elementDetails.craft !== undefined) {
                        const yields = elementDetails.craft[0].yield || 1;
                        const amount = Math.ceil(element.amount * addition.amount / yields);
                        list.addToPreCrafts( {
                            id: elementDetails.id,
                            icon: this.getIcon(elementDetails),
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
                    } else if (elementDetails.nodes !== undefined || elementDetails.fishingSpots !== undefined) {
                        list.addToGathers({
                            id: elementDetails.id,
                            icon: this.getIcon(elementDetails),
                            amount: element.amount * addition.amount,
                            done: 0,
                            name: this.i18n.createI18nName(elementDetails),
                            yield: 1,
                            addedAt: Date.now()
                        });
                    } else {
                        list.addToOthers({
                            id: elementDetails.id,
                            icon: this.getIcon(elementDetails),
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

    public setDone(pitem: ListRow, amount: number, list: List): void {
        const item = list.getItemById(pitem.id, pitem.addedAt);
        item.done += amount;
        if (item.done > item.amount) {
            item.done = item.amount;
        }
        if (item.requires !== undefined) {
            for (const requirement of item.requires) {
                const requirementItem = list.getItemById(requirement.id);
                this.setDone(requirementItem, requirement.amount * amount, list);
            }
        }
    }

    public resetDone(item: ListRow, list: List): void {
        item.done = 0;
        if (item.requires !== undefined) {
            item.requires.forEach(requirement => {
                const requirementItem = list.getItemById(requirement.id);
                this.resetDone(requirementItem, list);
            });
        }
    }
}
