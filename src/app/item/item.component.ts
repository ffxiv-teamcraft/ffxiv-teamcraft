import {Component, ElementRef, EventEmitter, Input, Output, ViewChild, OnInit} from '@angular/core';
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
import {CompactMasterbook} from '../model/compact-masterbook';
import {VendorsDetailsPopupComponent} from '../vendors-details-popup/vendors-details-popup.component';
import {Observable} from 'rxjs/Observable';
import {InstancesDetailsPopupComponent} from '../instances-details-popup/instances-details-popup.component';

@Component({
    selector: 'app-item',
    templateUrl: './item.component.html',
    styleUrls: ['./item.component.scss']
})
export class ItemComponent implements OnInit {

    @Input()
    item: ListRow;

    @ViewChild('doneInput')
    doneInput: ElementRef;

    @Output()
    update: EventEmitter<void> = new EventEmitter<void>();

    @Output()
    done: EventEmitter<any> = new EventEmitter<any>();

    constructor(private i18n: I18nTools, private translator: TranslateService, private dialog: MdDialog) {
    }

    ngOnInit(): void {
        Observable.fromEvent(this.doneInput.nativeElement, 'input')
            .debounceTime(500)
            .distinctUntilChanged()
            .map(() => {
                return this.doneInput.nativeElement.value;
            })
            .subscribe(value => {
                this.setDone(this.item, value - this.item.done);
            });
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

    public openTradeDetails(item: ListRow): void {
        this.dialog.open(TradeDetailsPopupComponent, {
            data: item
        });
    }

    public getXivdbDomain(): string {
        if (this.translator.currentLang === 'en') {
            return 'www';
        }
        return this.translator.currentLang;
    }
}
