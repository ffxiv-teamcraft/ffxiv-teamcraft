import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ItemDetailsPopup } from '../item-details-popup';
import { MogstationItem } from '../../list/model/mogstation-item';
import { DecimalPipe, CurrencyPipe } from '@angular/common';
import { FlexModule } from '@angular/flex-layout/flex';

@Component({
    selector: 'app-mogstation',
    templateUrl: './mogstation.component.html',
    styleUrls: ['./mogstation.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [FlexModule, DecimalPipe, CurrencyPipe]
})
export class MogstationComponent extends ItemDetailsPopup<MogstationItem> {

}
