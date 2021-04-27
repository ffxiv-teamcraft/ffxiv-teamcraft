import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ItemDetailsPopup } from '../item-details-popup';
import { GardeningData } from '../../list/model/gardening-data';
import { addHours, formatDistance } from 'date-fns';
import { LazyDataService } from '../../../core/data/lazy-data.service';

// @ts-ignore
@Component({
  selector: 'app-gardening',
  templateUrl: './gardening.component.html',
  styleUrls: ['./gardening.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GardeningComponent extends ItemDetailsPopup<GardeningData> implements OnInit {

  public formattedDuration: string;

  public seedId: number;

  constructor(private lazyData: LazyDataService) {
    super();
  }

  ngOnInit(): void {
    const targetDate = addHours(new Date(), this.details.duration);
    this.formattedDuration = formatDistance(new Date(), targetDate);
    this.seedId = this.lazyData.data.seeds[this.item.id]?.ffxivgId;
  }
}
