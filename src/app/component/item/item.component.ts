import {Component, ElementRef, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {ListRow} from '../../model/list/list-row';
import {I18nToolsService} from '../../core/i18n-tools.service';
import {GatheredByPopupComponent} from '../popup/gathered-by-popup/gathered-by-popup.component';
import {MdDialog} from '@angular/material';
import {DropsDetailsPopupComponent} from '../popup/drops-details-popup/drops-details-popup.component';
import {TradeDetailsPopupComponent} from '../popup/trade-details-popup/trade-details-popup.component';
import {I18nName} from '../../model/list/i18n-name';
import {DesynthPopupComponent} from '../popup/desynth-popup/desynth-popup.component';
import {CompactMasterbook} from '../../model/list/compact-masterbook';
import {VendorsDetailsPopupComponent} from '../popup/vendors-details-popup/vendors-details-popup.component';
import {InstancesDetailsPopupComponent} from '../popup/instances-details-popup/instances-details-popup.component';
import {DataService} from '../../core/api/data.service';
import {ReductionDetailsPopupComponent} from '../popup/reduction-details-popup/reduction-details-popup.component';
import {MathTools} from '../../tools/math-tools';
import {List} from '../../model/list/list';
import {RequirementsPopupComponent} from '../popup/requirements-popup/requirements-popup.component';
import {MediaChange, ObservableMedia} from '@angular/flex-layout';

@Component({
    selector: 'app-item',
    templateUrl: './item.component.html',
    styleUrls: ['./item.component.scss']
})
export class ItemComponent {

    @Input()
    item: ListRow;

    @ViewChild('doneInput')
    doneInput: ElementRef;

    @Output()
    update: EventEmitter<void> = new EventEmitter<void>();

    @Output()
    done: EventEmitter<any> = new EventEmitter<any>();

    @Input()
    recipe = false;

    @Input()
    list: List;

    @Input()
    showRequirements = false;

    tradeSourcePriorities = {
        // MGP, just in case
        5752: 20,
        // Seals
        20: 18,
        21: 18,
        22: 18,
        27: 18,
        7550: 18,
        // Tomestones
        23: 15,
        24: 15,
        26: 15,
        28: 15,
        10972: 15,
        11252: 15,
        7548: 15,
        7549: 15,
        8285: 15,
        9053: 15,
        // Scripts
        7553: 13,
        7554: 13,
        11090: 13,
        11091: 13,
        // Beast tribe currencies
        8477: 10,
        8267: 10,
        3455: 10,
        3456: 10,
        3457: 10,
        3458: 10,
        3459: 10,
        3460: 10,
        3461: 10,
        3462: 10,
        3463: 10,
        3464: 10,
        3465: 10,
        3466: 10,
        3467: 10,
        3468: 10,
        3469: 10,
        7812: 10,
        // Spoils
        7731: 2
    };

    constructor(private i18n: I18nToolsService,
                private data: DataService,
                private dialog: MdDialog,
                private media: ObservableMedia) {
    }

    openRequirementsPopup(): void {
        this.dialog.open(RequirementsPopupComponent, {data: {item: this.item, list: this.list}});
    }

    getAmount(): number {
        return this.recipe ? this.item.amount : this.item.amount_needed;
    }

    public getMasterBooks(item: ListRow): CompactMasterbook[] {
        const res: CompactMasterbook[] = [];
        for (const craft of item.craftedBy) {
            if (craft.masterbook !== undefined) {
                if (res.find(m => m.id === craft.masterbook.id) === undefined) {
                    res.push(craft.masterbook);
                }
            }
        }
        return res;
    }

    public setDone(row: ListRow, amount: number, done: number) {
        this.done.emit({row: row, amount: MathTools.absoluteCeil(amount - done)});
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

    public openReductionDetails(item: ListRow): void {
        this.dialog.open(ReductionDetailsPopupComponent, {
            data: item
        });
    }

    public openInstancesDetails(item: ListRow): void {
        this.dialog.open(InstancesDetailsPopupComponent, {
            data: item
        });
    }

    public openVendorsDetails(item: ListRow): void {
        this.dialog.open(VendorsDetailsPopupComponent, {
            data: item
        });
    }

    public getTradeIcon(item: ListRow): string {
        const res = {priority: 0, icon: 'https://www.garlandtools.org/db/images/Shop.png'};
        item.tradeSources.forEach(ts => {
            ts.trades.forEach(trade => {
                const id = +trade.currencyIcon.split('/').pop().split('.')[0];
                if (this.tradeSourcePriorities[id] !== undefined && this.tradeSourcePriorities[id] > res.priority) {
                    res.icon = trade.currencyIcon;
                    res.priority = this.tradeSourcePriorities[id];
                }
            });
        });
        return res.icon;
    }

    public openTradeDetails(item: ListRow): void {
        this.dialog.open(TradeDetailsPopupComponent, {
            data: item
        });
    }

    public getXivdbLink(item: ListRow): string {
        const name = this.i18n.getName(item.name);
        const link = this.data.getXivdbUrl(item.id, name);
        return this.i18n.getName(link);
    }

    public get isMobile():boolean{
        return this.media.isActive('xs') || this.media.isActive('sm');
    }
}
