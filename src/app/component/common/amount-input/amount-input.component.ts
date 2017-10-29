import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {Observable} from 'rxjs/Observable';

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
    craftAmount: number;

    @ViewChild('input')
    private input: ElementRef;

    @Output()
    onchange: EventEmitter<number> = new EventEmitter<number>();

    constructor() {
    }

    ngOnInit(): void {
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

    private registerOnChange(observable: Observable<number>): void {
        observable
            .map(value => +value)
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
        return (this.max || this.value || 0).toString().length * 12 + 20;
    }

}
