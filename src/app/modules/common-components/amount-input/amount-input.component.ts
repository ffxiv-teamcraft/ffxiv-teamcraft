import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {fromEvent, Observable} from 'rxjs';
// import {ComponentWithSubscriptions} from '../../../core/component/component-with-subscriptions';
import {distinctUntilChanged, filter, map} from 'rxjs/operators';

@Component({
    selector: 'app-amount-input',
    templateUrl: './amount-input.component.html',
    styleUrls: ['./amount-input.component.scss']
})
export class AmountInputComponent implements OnInit {

    @Input()
    value: number;

    @Input()
    readonly = false;

    @Input()
    maxlength: number;

    @Input()
    min: number;

    @Input()
    max: number;

    @Input()
    hideMax = false;

    @Input()
    hideMissingAmount = false;

    get missingAmount() {
        return this.max - this.value
    }

    @Input()
    craftAmount: number;

    @ViewChild('input')
    private input: ElementRef;

    @Output()
    onchange: EventEmitter<number> = new EventEmitter<number>();

    ngOnInit(): void {
        const focusOutObservable = fromEvent(this.input.nativeElement, 'focusout')
            .pipe(
                distinctUntilChanged(),
                map(() => {
                    return this.input.nativeElement.value;
                })
            );
        const keyUpObservable = fromEvent(this.input.nativeElement, 'keyup')
            .pipe(
                filter((e: KeyboardEvent) => e.keyCode === 13),
                map(() => {
                    return this.input.nativeElement.value;
                })
            );
        this.registerOnChange(focusOutObservable);
        this.registerOnChange(keyUpObservable);
    }

    private registerOnChange(observable: Observable<number>): void {
        observable.pipe(map(value => +value))
            .subscribe(value => {
                if (value > this.max) {
                    value = this.max;
                }
                if (value < this.min) {
                    value = this.min;
                }
                this.value = value;
                this.onchange.emit(value);
            });
    }

    public getWidth(): number {
        return (this.maxlength || (this.max || this.value || 0).toString().length) * 12 + 20;
    }

}
