import {Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild} from '@angular/core';
import {ListRow} from '../../../model/list/list-row';
import {Observable} from 'rxjs/Observable';
import {ComponentWithSubscriptions} from '../../../core/component/component-with-subscriptions';

@Component({
    selector: 'app-ffxivcrafting-amount-input',
    templateUrl: './ffxivcrafting-amount-input.component.html',
    styleUrls: ['./ffxivcrafting-amount-input.component.scss']
})
export class FfxivcraftingAmountInputComponent extends ComponentWithSubscriptions implements OnInit, OnChanges {

    @Input()
    total: number;

    @Input()
    item: ListRow;

    @Output()
    onchange: EventEmitter<number> = new EventEmitter<number>();

    @ViewChild('input')
    private input: ElementRef;

    public craftingAmountRequired = false;

    public craftingAmount = 0;

    constructor() {
        super();
    }

    ngOnInit(): void {
        this.updateCraftingAmountRequired();
        this.updateCraftingAmount();
        const focusOutObservable = Observable.fromEvent(this.input.nativeElement, 'focusout')
            .distinctUntilChanged()
            .map(() => {
                return this.input.nativeElement.value;
            });
        const keyUpObservable = Observable.fromEvent(this.input.nativeElement, 'keyup')
            .filter((e: KeyboardEvent) => e.keyCode === 13)
            .map(() => {
                return this.input.nativeElement.value;
            });
        this.registerOnChange(focusOutObservable);
        this.registerOnChange(keyUpObservable);
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.updateCraftingAmountRequired();
        this.updateCraftingAmount();
    }

    private registerOnChange(observable: Observable<number>): void {
        this.subscriptions.push(observable
            .map(value => +value)
            .subscribe(value => {
                if (value > this.total - this.item.used) {
                    value = this.total - this.item.used;
                }
                if (value < 0) {
                    value = 0;
                }
                this.onchange.emit(value + this.item.used);
            }));
    }

    public updateCraftingAmountRequired(): void {
        this.craftingAmountRequired = this.item.craftedBy !== undefined && this.item.yield > 1;
    }

    public updateCraftingAmount(): void {
        this.craftingAmount = Math.floor(this.item.amount_needed - (this.item.done / this.item.yield));
    }

    public getWidth(): number {
        return (this.total || this.item.done || 0).toString().length * 12 + 20;
    }
}
