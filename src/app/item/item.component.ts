import {Component, EventEmitter, Input, Output} from '@angular/core';
import {ListRow} from '../model/list-row';
import {I18nTools} from '../core/i18n-tools';
import {TranslateService} from '@ngx-translate/core';

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

    constructor(private i18n: I18nTools, private translator: TranslateService) {
    }

    public setDone(row: ListRow, amount: number) {
        this.done.emit({row: row, amount: amount});
    }

    public getName(item: ListRow) {
        return this.i18n.getName(item.name);
    }

    public getXivdbDomain(): string {
        if (this.translator.currentLang === 'en') {
            return 'www';
        }
        return this.translator.currentLang;
    }
}
