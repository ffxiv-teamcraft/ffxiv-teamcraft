import { DataType } from '../../modules/list/data/data-type';
import { getItemSource, ListRow } from '../../modules/list/model/list-row';
import { NpcBreakdownRow } from './npc-breakdown-row';
import { LazyDataService } from '../../core/data/lazy-data.service';
import { TradeSource } from '../../modules/list/model/trade-source';
import { TradeIconPipe } from '../../pipes/pipes/trade-icon.pipe';
import { beastTribeNpcs } from '../../core/data/sources/beast-tribe-npcs';

export class NpcBreakdown {
  private readonly _rows: NpcBreakdownRow[] = [];

  private readonly canSkip: Record<number, number> = {};

  public get rows(): NpcBreakdownRow[] {
    return this._rows;
  }

  constructor(rows: ListRow[], private lazyData: LazyDataService, private prioritizeHousingSupplier: boolean) {
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

  private handleVendors(row: ListRow): void {
    const vendors = getItemSource(row, DataType.VENDORS);
    const bestNpc = vendors.sort((a, b) => {
      return this.getRowScore(b.npcId) - this.getRowScore(a.npcId);
    })[0];
    this.addRow(bestNpc.npcId, row);
  }

  private handleTradeSources(row: ListRow): void {
    const tradeSources = getItemSource(row, DataType.TRADE_SOURCES);
    const bestNpc = tradeSources
      .filter(ts => !!ts)
      .sort((a, b) => {
        return this.getTradeSourceScore(b) - this.getTradeSourceScore(a);
      })
      .map(ts => ts.npcs)
      .flat()
      .filter(npc => !!npc)
      .sort((a, b) => {
        return this.getRowScore(b.id) - this.getRowScore(a.id);
      })[0];
    this.addRow(bestNpc?.id || -1, row);
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

  private getRowScore(npcId: number): number {
    // Hardcoded fix for Anna, has a wrong map for some reason.
    if (npcId === 1033785) {
      return 0;
    }
    // If it's sold by material supplier and setting is enabled, favor this over anything else.
    if (this.prioritizeHousingSupplier && [1005633, 1008837].includes(npcId)) {
      return 100;
    }
    const sameNpc = this._rows.find(r => r.npcId === npcId);
    if (sameNpc) {
      return 10 + sameNpc.items.length;
    }
    if (this._rows.some(r => this.lazyData.data.npcs[r.npcId]?.position && this.lazyData.data.npcs[r.npcId]?.position?.map === this.lazyData.data.npcs[npcId]?.position?.map)) {
      return 8;
    }
    if (this.lazyData.data.npcs[npcId]?.position) {
      return 5;
    }
    if (beastTribeNpcs.includes(npcId)) {
      return 3;
    }
    return 0;
  }

  private addRow(npcId: number, row: ListRow): void {
    let breakdownRow = this._rows.find(r => r.npcId === npcId);
    if (breakdownRow === undefined) {
      const position = this.lazyData.data.npcs[npcId]?.position;
      this._rows.push({ npcId, position, items: [] });
      breakdownRow = this._rows[this._rows.length - 1];
    }
    breakdownRow.items.push(row);
  }
}
