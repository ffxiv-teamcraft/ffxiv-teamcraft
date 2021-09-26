import { ChangeDetectionStrategy, Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-predators-input',
  templateUrl: './predators-input.component.html',
  styleUrls: ['./predators-input.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => PredatorsInputComponent),
    multi: true
  }]
})
export class PredatorsInputComponent implements ControlValueAccessor {

  @Input()
  fishingSpot: any;

  predatorModel = { id: null, amount: null };

  predators: { id: number, amount: number }[] = [];

  disabled = false;

  private onChange: Function = () => {
  };
  private onTouched: Function = () => {
  };

  addPredator(): void {
    this.predators = [...this.predators, this.predatorModel];
    this.predatorModel = { id: null, amount: null };
    this.onChange(this.predators);
  }

  removePredator(id: number): void {
    this.predators = this.predators.filter(p => p.id !== id);
    this.onChange(this.predators);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  writeValue(obj: { id: number, amount: number }[]): void {
    if (Array.isArray(obj)) {
      this.predators = obj;
    }
  }

}
