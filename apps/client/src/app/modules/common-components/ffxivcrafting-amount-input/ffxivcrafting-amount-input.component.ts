import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { ListRow } from '../../../core/list/model/list-row';
import { fromEvent, Observable } from 'rxjs';
import { distinctUntilChanged, filter, map } from 'rxjs/operators';

@Component({
  selector: 'app-ffxivcrafting-amount-input',
  templateUrl: './ffxivcrafting-amount-input.component.html',
  styleUrls: ['./ffxivcrafting-amount-input.component.scss']
})
export class FfxivcraftingAmountInputComponent implements OnInit, OnChanges {

  @Input()
  total: number;

  @Input()
  item: ListRow;

  @Output()
  onchange: EventEmitter<number> = new EventEmitter<number>();

  @Input()
  readonly = false;
  public craftingAmountRequired = false;
  public craftingAmount = 0;
  @ViewChild('input')
  private input: ElementRef;

  ngOnInit(): void {
    this.updateCraftingAmountRequired();
    this.updateCraftingAmount();
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

  ngOnChanges(changes: SimpleChanges): void {
    this.updateCraftingAmountRequired();
    this.updateCraftingAmount();
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

  private registerOnChange(observable: Observable<number>): void {
    observable.pipe(map(value => +value))
      .subscribe(value => {
        if (value > this.total - this.item.used) {
          value = this.total - this.item.used;
        }
        if (value < 0) {
          value = 0;
        }
        this.onchange.emit(value + this.item.used);
      });
  }
}
