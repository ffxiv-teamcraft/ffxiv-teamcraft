import {AbstractExtractor} from './abstract-extractor';
import {TradeSource} from '../../../../model/list/trade-source';
import {ItemData} from '../../../../model/garland-tools/item-data';
import {Observable} from 'rxjs/Observable';
import {DataType} from '../data-type';
import {Trade} from '../../../../model/list/trade';
import {DataService} from '../../../api/data.service';
import {Item} from '../../../../model/garland-tools/item';

export class TradeSourcesExtractor extends AbstractExtractor<TradeSource[]> {

    constructor(private db: DataService) {
        super();
    }

    protected canExtract(item: Item): boolean {
        return item.tradeSources !== undefined;
    }

    protected doExtract(item: Item, itemData: ItemData): Observable<TradeSource[]> {
        const tradeSources: Observable<TradeSource> [] = [];
        for (const ts of Object.keys(item.tradeSources)) {
            const tradeObs = Observable
                .of({
                    npcId: +ts,
                    zoneId: 0
                })
                .switchMap((tradeSource: TradeSource) => {
                    return this.db.getNpc(+ts)
                        .map(data => {
                            if (data.npc.zoneid === undefined) {
                                return undefined;
                            }
                            tradeSource.zoneId = data.npc.zoneid;
                            return tradeSource as TradeSource;
                        });
                })
                .switchMap((tradeSource: TradeSource) => {
                    const trades: Observable<Trade>[] = [];
                    for (const row of item.tradeSources[ts]) {
                        const obs: Observable<Trade> = Observable
                            .of({
                                itemIcon: 0,
                                itemAmount: 0,
                                itemId: 0,
                                currencyIcon: 0,
                                currencyAmount: 0,
                                currencyId: 0,
                                itemHQ: false
                            })
                            .switchMap(trade => {
                                return this.db.getItem(+row.item[0].id)
                                    .map(data => {
                                        trade.itemIcon = data.item.icon;
                                        trade.itemAmount = row.item[0].amount;
                                        trade.itemId = data.item.id;
                                        trade.itemHQ = row.item[0].hq === 1;
                                        return trade;
                                    });
                            })
                            .switchMap(trade => {
                                return this.db.getItem(+row.currency[0].id)
                                    .map(data => {
                                        trade.currencyIcon = data.item.icon;
                                        trade.currencyAmount = row.currency[0].amount;
                                        trade.currencyId = data.item.id;
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

    public isAsync(): boolean {
        return true;
    }

    public getDataType(): DataType {
        return DataType.TRADE_SOURCES;
    }

}
