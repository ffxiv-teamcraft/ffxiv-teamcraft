import { ChangeDetectionStrategy, Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { ItemNamePipe } from '../../../pipes/pipes/item-name.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { I18nPipe } from '../../../core/i18n.pipe';
import { I18nNameComponent } from '../../../core/i18n/i18n-name/i18n-name.component';
import { ItemIconComponent } from '../../../modules/item-icon/item-icon/item-icon.component';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzWaveModule } from 'ng-zorro-antd/core/wave';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NgFor, NgIf } from '@angular/common';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { FlexModule } from '@angular/flex-layout/flex';

@Component({
    selector: 'app-predators-input',
    templateUrl: './predators-input.component.html',
    styleUrls: ['./predators-input.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [{
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => PredatorsInputComponent),
            multi: true
        }],
    standalone: true,
    imports: [FlexModule, NzSelectModule, FormsModule, NgFor, NgIf, NzInputModule, NzButtonModule, NzWaveModule, NzIconModule, ItemIconComponent, I18nNameComponent, I18nPipe, TranslateModule, ItemNamePipe]
})
export class PredatorsInputComponent implements ControlValueAccessor {

  @Input()
  fishingSpot: any;

  @Input()
  possibleFishList: number[];

  predatorModel = { id: null, amount: null };

  predators: { id: number, amount: number }[] = [];

  disabled = false;

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

  private onChange = (change: any) => {
    return void 0;
  };

  private onTouched = () => {
    return void 0;
  };

}
