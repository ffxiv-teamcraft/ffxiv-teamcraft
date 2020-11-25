import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Commission } from '../model/commission';
import { Router } from '@angular/router';
import { List } from '../../list/model/list';
import { ListRow } from '../../list/model/list-row';

@Component({
  selector: 'app-commission-panel',
  templateUrl: './commission-panel.component.html',
  styleUrls: ['./commission-panel.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommissionPanelComponent {

  @Input()
  commission: Commission;

  @Input()
  list: List;

  constructor(private router: Router) {
  }

  public openCommission(): void {
    this.router.navigate(['/commissions/', this.commission.$key]);
  }

  trackByItem(index: number, item: ListRow): number {
    return item.id;
  }

}
