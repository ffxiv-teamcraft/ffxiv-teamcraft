import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ItemDetailsPopup } from '../item-details-popup';
import { GardeningData } from '../../list/model/gardening-data';
import { addHours, formatDistance } from 'date-fns';
import { ItemNamePipe } from '../../../pipes/pipes/item-name.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { I18nPipe } from '../../../core/i18n.pipe';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NgIf, NgFor } from '@angular/common';
import { ItemIconComponent } from '../../item-icon/item-icon/item-icon.component';
import { FlexModule } from '@angular/flex-layout/flex';

@Component({
    selector: 'app-gardening',
    templateUrl: './gardening.component.html',
    styleUrls: ['./gardening.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [FlexModule, ItemIconComponent, NgIf, NzDividerModule, NgFor, I18nPipe, TranslateModule, ItemNamePipe]
})
export class GardeningComponent extends ItemDetailsPopup<GardeningData> implements OnInit {

  public formattedDuration: string;

  ngOnInit(): void {
    const targetDate = addHours(new Date(), this.details.duration);
    if (this.details.duration > 0) {
      this.formattedDuration = formatDistance(new Date(), targetDate);
    }
    super.ngOnInit();
  }
}
