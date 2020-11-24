import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Commission } from '../model/commission';
import { Router } from '@angular/router';

@Component({
  selector: 'app-commission-panel',
  templateUrl: './commission-panel.component.html',
  styleUrls: ['./commission-panel.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommissionPanelComponent {

  @Input()
  commission: Commission;

  constructor(private router: Router) {
  }

  public openCommission(): void {
    this.router.navigate([]);
  }

}
