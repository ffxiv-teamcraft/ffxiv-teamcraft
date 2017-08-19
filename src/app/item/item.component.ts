import {Component, EventEmitter, Input, Output} from '@angular/core';
import {ListRow} from '../model/list-row';
import {I18nTools} from '../core/i18n-tools';
import {TranslateService} from '@ngx-translate/core';
import {GatheredByPopupComponent} from '../gathered-by-popup/gathered-by-popup.component';
import {MdDialog} from '@angular/material';
import {DropsDetailsPopupComponent} from '../drops-details-popup/drops-details-popup.component';
import {TradeDetailsPopupComponent} from '../trade-details-popup/trade-details-popup.component';
import {TradeSource} from '../model/trade-source';
import {I18nName} from '../model/i18n-name';
import {DesynthPopupComponent} from '../desynth-popup/desynth-popup.component';

@Component({
    selector: 'app-item',
    templateUrl: './item.component.html',
    styleUrls: ['./item.component.scss']
})
export class ItemComponent {

    @Input()
    item: ListRow;

    @Output()
    update: EventEmitter<void> = new EventEmitter<void>();

    @Output()
    done: EventEmitter<any> = new EventEmitter<any>();

    constructor(private i18n: I18nTools, private translator: TranslateService, private dialog: MdDialog) {
    }

    public setDone(row: ListRow, amount: number) {
        this.done.emit({row: row, amount: amount});
    }

    public getName(item: ListRow) {
        return this.i18n.getName(item.name);
    }

    public getI18n(name: I18nName) {
        return this.i18n.getName(name);
    }

    public openGatheredByDetails(item: ListRow): void {
        this.dialog.open(GatheredByPopupComponent, {
            data: item
        });
    }

    public openDropsDetails(item: ListRow): void {
        this.dialog.open(DropsDetailsPopupComponent, {
            data: item
        });
    }
    public openDesynthDetails(item: ListRow): void {
        this.dialog.open(DesynthPopupComponent, {
            data: item
        });
    }

    public openTradeDetails(item: ListRow, tradeSource: TradeSource): void {
        this.dialog.open(TradeDetailsPopupComponent, {
            data: {item: item, tradeSource: tradeSource}
        });
    }

    public getXivdbDomain(): string {
        if (this.translator.currentLang === 'en') {
            return 'www';
        }
        return this.translator.currentLang;
    }
}
