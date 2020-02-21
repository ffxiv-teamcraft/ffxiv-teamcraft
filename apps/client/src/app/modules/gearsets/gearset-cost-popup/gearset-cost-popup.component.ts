import { Component, Input, OnInit } from '@angular/core';
import { TeamcraftGearset } from '../../../model/gearset/teamcraft-gearset';
import { LazyDataService } from '../../../core/data/lazy-data.service';
import { getItemSource } from '../../list/model/list-row';
import { DataType } from '../../list/data/data-type';
import { TradeSource } from '../../list/model/trade-source';
import { TranslateService } from '@ngx-translate/core';
import { TradeEntry } from '../../list/model/trade-entry';

@Component({
  selector: 'app-gearset-cost-popup',
  templateUrl: './gearset-cost-popup.component.html',
  styleUrls: ['./gearset-cost-popup.component.less']
})
export class GearsetCostPopupComponent implements OnInit {

  @Input()
  gearset: TeamcraftGearset;

  costs: { id: string | number, amount: number }[] = [];

  constructor(private lazyData: LazyDataService, public translate: TranslateService) {
  }

  ngOnInit(): void {
    Object.keys(this.gearset)
      .filter(key => this.gearset[key] && this.gearset[key].itemId !== undefined)
      .forEach(key => {
        const gearPiece = this.gearset[key];
        const itemExtract = this.lazyData.extracts.find(row => row.id === gearPiece.itemId);
        const trades = getItemSource<TradeSource[]>(itemExtract, DataType.TRADE_SOURCES);
        trades.forEach(trade => {
          trade.trades.forEach(t => {
            t.currencies.forEach(currency => {
              this.addCurrency(currency);
            });
          });
        });
      });
  }

  private addCurrency(currency: TradeEntry): void {
    // If you can equip this item, let's trigger recursion and not include it as a trade currency
    if (this.lazyData.data.itemEquipSlotCategory[currency.id]) {
      const itemExtract = this.lazyData.extracts.find(row => row.id === currency.id);
      const trades = getItemSource<TradeSource[]>(itemExtract, DataType.TRADE_SOURCES);
      if (trades.length > 0) {
        trades.forEach(trade => {
          trade.trades.forEach(t => {
            t.currencies.forEach(c => {
              this.addCurrency(c);
            });
          });
        });
        return;
      }
    }
    let costRow = this.costs.find(c => c.id === currency.id);
    if (costRow === undefined) {
      this.costs.push({
        id: currency.id,
        amount: 0
      });
      costRow = this.costs[this.costs.length - 1];
    }
    costRow.amount += currency.amount;
  }

}
