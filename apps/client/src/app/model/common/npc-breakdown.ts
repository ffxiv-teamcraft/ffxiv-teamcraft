import { DataType } from '../../modules/list/data/data-type';
import { getItemSource, ListRow } from '../../modules/list/model/list-row';
import { NpcBreakdownRow } from './npc-breakdown-row';
import { TradeSource } from '../../modules/list/model/trade-source';
import { TradeIconPipe } from '../../pipes/pipes/trade-icon.pipe';
import { beastTribeNpcs } from '../../core/data/sources/beast-tribe-npcs';
import { LazyDataFacade } from '../../lazy-data/+state/lazy-data.facade';
import { Observable, of } from 'rxjs';
import { safeCombineLatest } from '../../core/rxjs/safe-combine-latest';
import { map } from 'rxjs/operators';
import { housingMaterialSuppliers } from '../../core/data/sources/housing-material-suppliers';
import { LazyShopsByNpc } from '../../lazy-data/model/lazy-shops-by-npc';
import { LazyNpc } from '../../lazy-data/model/lazy-npc';

export class NpcBreakdown {
  private readonly _rows: NpcBreakdownRow[] = [];

  private readonly canSkip: Record<number, number> = {};

  constructor(rows: ListRow[], private lazyData: LazyDataFacade, private prioritizeHousingSupplier: boolean) {
    // You can skip an item if there's another item requiring it inside the same array
    this.canSkip = rows.reduce((registry, row) => {
      return {
        ...registry,
        [row.id]: rows.reduce((acc, r) => {
          const requirement = (r.requires || []).find(req => +req.id === +row.id);
          if (requirement) {
            return acc + requirement.amount * ((r.amount_needed || r.amount) - r.done);
          }
          return Math.max(acc, 0);
        }, 0)
      };
    }, {});

    rows.forEach(row => {
      if (getItemSource(row, DataType.VENDORS).length > 0) {
        this.handleVendors(row);
      } else if (getItemSource(row, DataType.TRADE_SOURCES).length > 0) {
        this.handleTradeSources(row);
      } else {
        // Uh what?
        return this.addRow(-1, row);
      }
    });

    this._rows = this._rows.sort((a, b) => {
      return a.position?.zoneid - b.position?.zoneid;
    });

    this._rows = this._rows.map(row => {
      row.items = row.items.sort((a, b) => {
        return this.canSkip[a.id] - this.canSkip[b.id];
      });
      return row;
    });
  }

  public get rows(): NpcBreakdownRow[] {
    return this._rows;
  }

  private handleVendors(row: ListRow): void {
    const vendors = getItemSource(row, DataType.VENDORS);
    safeCombineLatest(vendors.map(vendor => {
      return this.getRowScore(vendor.npcId).pipe(
        map(score => ({ vendor, score }))
      );
    })).subscribe(scored => {
      const bestNpc = scored.sort((a, b) => b.score - a.score)[0];
      this.addRow(bestNpc.vendor.npcId, row);
    });
  }

  private handleTradeSources(row: ListRow): void {
    const tradeSources = getItemSource(row, DataType.TRADE_SOURCES);
    safeCombineLatest(tradeSources
      .filter(ts => !!ts)
      .map(ts => {
        return {
          tradeSource: ts,
          tradeSourceScore: this.getTradeSourceScore(ts)
        };
      })
      .sort((a, b) => b.tradeSourceScore - a.tradeSourceScore)
      .map(ts => ts.tradeSource.npcs)
      .flat()
      .filter(npc => !!npc)
      .map(npc => {
        return this.getRowScore(npc.id).pipe(
          map(score => ({ npc, score }))
        );
      })
    ).subscribe(scored => {
      const bestNpc = scored.sort((a, b) => b.score - a.score)[0];
      this.addRow(bestNpc?.npc?.id || -1, row);
    });
  }

  private getTradeSourceScore(tradeSource: TradeSource): number {
    return tradeSource.trades
      .map(trade => {
        return trade.currencies
          .map(currency => TradeIconPipe.TRADE_SOURCES_PRIORITIES[currency.id])
          .sort((ca, cb) => cb.ca)[0];
      })
      .sort((a, b) => {
        return b - a;
      })[0];
  }

  private getRowScore(npcId: number): Observable<number> {
    // Hardcoded fix for Anna, has a wrong map for some reason.
    if (npcId === 1033785) {
      return of(0);
    }
    // If it's sold by material supplier and setting is enabled, favor this over anything else.
    if (this.prioritizeHousingSupplier && housingMaterialSuppliers.includes(npcId)) {
      return of(100);
    }
    const sameNpc = this._rows.find(r => r.npcId === npcId);
    if (sameNpc) {
      return of(10 + sameNpc.items.length);
    }
    return safeCombineLatest([
      this.lazyData.getRow('shopsByNpc', npcId),
      this.lazyData.getRow('npcs', npcId).pipe(
        map(res => ({ id: npcId, ...res }))
      ),
      safeCombineLatest(this._rows.map(r => {
        return this.lazyData.getRow('npcs', r.npcId).pipe(
          map(res => ({ id: r.npcId, ...res }))
        );
      }))
    ]).pipe(
      map(([shops, currentNpc, rowsNpcs]: [LazyShopsByNpc[], LazyNpc, LazyNpc[]]) => {
        const bonus = shops.reduce((acc, s) => acc + s.trades.length, 0);
        if (rowsNpcs.some(npc => npc.position && npc.position?.map === currentNpc?.position?.map)) {
          return 8 * bonus;
        }
        if (currentNpc?.position) {
          return 3 * bonus;
        }
        if (beastTribeNpcs.includes(npcId)) {
          return 2 * bonus;
        }
        return 0;
      })
    );
  }

  private addRow(npcId: number, row: ListRow): void {
    this.lazyData.getRow('npcs', npcId).subscribe(npc => {
      let breakdownRow = this._rows.find(r => r.npcId === npcId);
      if (breakdownRow === undefined) {
        const position = npc?.position;
        this._rows.push({ npcId, position, items: [] });
        breakdownRow = this._rows[this._rows.length - 1];
      }
      breakdownRow.items.push(row);
    });
  }
}
