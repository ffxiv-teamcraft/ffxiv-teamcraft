import { DataType } from '../../modules/list/data/data-type';
import { getItemSource, ListRow } from '../../modules/list/model/list-row';
import { NpcBreakdownRow } from './npc-breakdown-row';
import { TradeSource } from '../../modules/list/model/trade-source';
import { TradeIconPipe } from '../../pipes/pipes/trade-icon.pipe';
import { beastTribeNpcs } from '../../core/data/sources/beast-tribe-npcs';
import { LazyDataFacade } from '../../lazy-data/+state/lazy-data.facade';
import { combineLatest, from, Observable, of, switchMap } from 'rxjs';
import { housingMaterialSuppliers } from '../../core/data/sources/housing-material-suppliers';
import { map, mergeScan } from 'rxjs/operators';

export class NpcBreakdown {
  private readonly canSkip: Record<number, number> = {};

  public rows$: Observable<NpcBreakdownRow[]>;

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

    const rowsWithNpcs = rows
      .map(row => {
        return {
          row,
          npcs: this.getNpcs(row)
        };
      })
      .sort((a, b) => {
        return a.npcs.length - b.npcs.length;
      });

    this.rows$ = from(rowsWithNpcs).pipe(
      mergeScan((breakdown, entry) => {
        if (entry.npcs.length === 0) {
          return this.addRow(-1, entry.row, breakdown);
        }
        return combineLatest(entry.npcs.map(npc => {
          return this.getRowScore(npc, rowsWithNpcs).pipe(
            map(score => {
              return {
                npc,
                score
              };
            })
          );
        })).pipe(
          switchMap(scoredNpcs => {
            return this.addRow(scoredNpcs.sort((a, b) => b.score - a.score)[0].npc, entry.row, breakdown);
          })
        );
      }, [] as NpcBreakdownRow[], 1),
      map(breakdown => {
        return breakdown.sort((a, b) => {
          return a.position?.zoneid - b.position?.zoneid;
        }).map(row => {
          row.items = row.items.sort((a, b) => {
            return this.canSkip[a.id] - this.canSkip[b.id];
          });
          return row;
        });
      })
    );
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

  private getRowScore(npcId: number, rowsWithNpcs: { row: ListRow, npcs: number[] }[]): Observable<number> {
    // Hardcoded fix for Anna, has a wrong map for some reason.
    if (npcId === 1033785) {
      return of(0);
    }
    // If it's sold by material supplier and setting is enabled, favor this over anything else.
    if (this.prioritizeHousingSupplier && housingMaterialSuppliers.includes(+npcId)) {
      return of(1000);
    }
    const commonNpcBonus = rowsWithNpcs.filter(row => row.npcs.some(npc => npc === npcId)).length;
    if (beastTribeNpcs.includes(npcId)) {
      return of(2 * commonNpcBonus);
    }
    return this.lazyData.getRow('npcs', npcId).pipe(
      map(res => ({ id: npcId, ...res }))
    ).pipe(
      map((currentNpc) => {
        if (currentNpc?.position) {
          return 3 * commonNpcBonus;
        }
        return 0;
      })
    );
  }

  private addRow(npcId: number, row: ListRow, rows: NpcBreakdownRow[]): Observable<NpcBreakdownRow[]> {
    return this.lazyData.getRow('npcs', npcId).pipe(
      map(npc => {
        let breakdownRow = rows.find(r => r.npcId === npcId);
        if (breakdownRow === undefined) {
          const position = npc?.position;
          rows = [...rows, { npcId, position, items: [] }];
          breakdownRow = rows[rows.length - 1];
        }
        breakdownRow.items = [...breakdownRow.items, row];
        return rows;
      })
    );
  }

  private getNpcs(row: ListRow): number[] {
    const vendors = getItemSource(row, DataType.VENDORS);
    if (vendors.length > 0) {
      return vendors.filter(v => !v.festival).map(v => v.npcId);
    }
    const tradeSources = getItemSource(row, DataType.TRADE_SOURCES);
    if (tradeSources.length > 0) {
      return tradeSources
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
        .filter(npc => !!npc && !npc.festival)
        .map(npc => npc.id);
    }
  }
}
