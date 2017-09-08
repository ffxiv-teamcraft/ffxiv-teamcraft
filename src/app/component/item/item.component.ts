import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
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
import {Observable} from 'rxjs/Observable';
import {InstancesDetailsPopupComponent} from '../popup/instances-details-popup/instances-details-popup.component';
import {DataService} from '../../core/api/data.service';

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

    constructor(private i18n: I18nToolsService,
                private data: DataService,
                private dialog: MdDialog) {
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

    public getXivdbLink(item: any): string {
        const name = this.getName(item);
        const link = this.data.getXivdbUrl(item.id, name);
        return this.i18n.getName(link);
    }
}
