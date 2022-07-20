import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ItemDetailsPopup } from '../item-details-popup';
import { GardeningData } from '../../list/model/gardening-data';
import { addHours, formatDistance } from 'date-fns';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { Observable } from 'rxjs';
import { pluck } from 'rxjs/operators';

// @ts-ignore
@Component({
  selector: 'app-gardening',
  templateUrl: './gardening.component.html',
  styleUrls: ['./gardening.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GardeningComponent extends ItemDetailsPopup<GardeningData> implements OnInit {

  public formattedDuration: string;

  public seedId$: Observable<number>;

  constructor(private lazyData: LazyDataFacade) {
    super();
  }

  ngOnInit(): void {
    const targetDate = addHours(new Date(), this.details.duration);
    if (this.details.duration > 0) {
      this.formattedDuration = formatDistance(new Date(), targetDate);
      this.seedId$ = this.lazyData.getRow('seeds', this.item.id, { ffxivgId: null, duration: 0, seed: 0 }).pipe(
        pluck('ffxivgId')
      );
    }
    super.ngOnInit();
  }
}
