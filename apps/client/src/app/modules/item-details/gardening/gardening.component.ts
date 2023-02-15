import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ItemDetailsPopup } from '../item-details-popup';
import { GardeningData } from '../../list/model/gardening-data';
import { addHours, formatDistance } from 'date-fns';

@Component({
  selector: 'app-gardening',
  templateUrl: './gardening.component.html',
  styleUrls: ['./gardening.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
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
