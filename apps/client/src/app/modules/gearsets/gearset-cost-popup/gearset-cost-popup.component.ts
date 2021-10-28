import { Component, Input } from '@angular/core';
import { TeamcraftGearset } from '../../../model/gearset/teamcraft-gearset';
import { getItemSource, ListRow } from '../../list/model/list-row';
import { DataType } from '../../list/data/data-type';
import { TradeSource } from '../../list/model/trade-source';
import { TranslateService } from '@ngx-translate/core';
import { TradeEntry } from '../../list/model/trade-entry';
import { GearsetProgression } from '../../../model/gearset/gearset-progression';
import { safeCombineLatest } from '../../../core/rxjs/safe-combine-latest';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { map, switchMap, tap } from 'rxjs/operators';
import { combineLatest, Observable } from 'rxjs';
import { LazyData } from '../../../lazy-data/lazy-data';
import { observeInput } from '../../../core/rxjs/observe-input';

@Component({
  selector: 'app-gearset-cost-popup',
  templateUrl: './gearset-cost-popup.component.html',
  styleUrls: ['./gearset-cost-popup.component.less']
})
export class GearsetCostPopupComponent {

  @Input()
  gearset: TeamcraftGearset;

  @Input()
  progression: GearsetProgression;

  costs$: Observable<{ id: string | number, amount: number }[]> = combineLatest([
    observeInput(this, 'gearset'),
    observeInput(this, 'progression')
  ]).pipe(
    switchMap(([gearset, progression]) => {
      return safeCombineLatest(Object.keys(gearset)
        .filter(key => {
          const validPiece = gearset[key] && gearset[key].itemId !== undefined;
          const notDone = !progression || !progression[key]?.item;
          return validPiece && notDone;
        })
        .map(key => {
          const gearPiece = gearset[key];
          return this.lazyData.getRow('extracts', gearPiece.itemId).pipe(
            map(itemExtract => {
              const trades = getItemSource<TradeSource[]>(itemExtract, DataType.TRADE_SOURCES);
              return trades.filter(trade => trade.npcs.length > 0)
                .map(trade => {
                  return trade.trades.map(t => {
                    return t.currencies;
                  }).flat();
                }).flat();
            })
          );
        })
      );
    }),
    switchMap((currencies) => {
      return combineLatest([
        this.lazyData.getEntry('extracts'),
        this.lazyData.getEntry('itemEquipSlotCategory')
      ]).pipe(
        map(([extracts, itemEquipSlotCategory]) => {
          return this.mergeCosts(...currencies.flat().map(currency => {
            return this.computeCosts(currency, itemEquipSlotCategory, extracts);
          }).flat());
        })
      );
    })
  );

  constructor(private lazyData: LazyDataFacade, public translate: TranslateService) {
  }

  private computeCosts(currency: TradeEntry, itemEquipSlotCategory: LazyData['itemEquipSlotCategory'], extracts: Record<number, ListRow>, costs = []): { id: string | number, amount: number }[] {
    // If you can equip this item, let's trigger recursion and not include it as a trade currency
    if (itemEquipSlotCategory[currency.id]) {
      const itemExtract = extracts[+currency.id];
      const trades = getItemSource<TradeSource[]>(itemExtract, DataType.TRADE_SOURCES);
      if (trades.length > 0) {
        const tradeCurrencyCosts = trades
          .filter(trade => trade.npcs.length > 0)
          .map(trade => {
            return trade.trades.map(t => {
              return t.currencies.map(c => {
                return this.computeCosts(c, itemEquipSlotCategory, extracts);
              }).flat();
            }).flat();
          }).flat();
        return this.mergeCosts(...costs, ...tradeCurrencyCosts);
      }
    }
    return this.mergeCosts(...costs, { id: currency.id, amount: currency.amount });
  }

  private mergeCosts(...costs: { id: string | number, amount: number }[]): { id: string | number, amount: number }[] {
    const newCosts = [];
    costs.forEach(cost => {
      let costRow = newCosts.find(c => c.id === cost.id);
      if (costRow === undefined) {
        newCosts.push({
          id: cost.id,
          amount: 0
        });
        costRow = newCosts[newCosts.length - 1];
      }
      costRow.amount += cost.amount;
    });
    return newCosts;
  }

}
