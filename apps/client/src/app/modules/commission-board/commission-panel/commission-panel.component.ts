import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Commission } from '../model/commission';
import { Router } from '@angular/router';
import { ListRow } from '../../list/model/list-row';
import { TranslateService } from '@ngx-translate/core';
import { CommissionStatus } from '../model/commission-status';
import { AuthFacade } from '../../../+state/auth.facade';
import { Observable } from 'rxjs';
import { CommissionsFacade } from '../+state/commissions.facade';

@Component({
  selector: 'app-commission-panel',
  templateUrl: './commission-panel.component.html',
  styleUrls: ['./commission-panel.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommissionPanelComponent {

  CommissionStatus = CommissionStatus;

  @Input()
  commission: Commission;

  @Input()
  showStatus = false;

  public userId$: Observable<string> = this.authFacade.userId$;

  constructor(private router: Router, public translate: TranslateService,
              private authFacade: AuthFacade, public commissionsFacade: CommissionsFacade) {
  }

  openCommission(): void {
    this.router.navigate(['/commissions/', this.commission.$key]);
  }

  deleteCommission(withLists: boolean): void {
    this.commissionsFacade.delete(this.commission.$key, withLists);
  }

  trackByItem(index: number, item: ListRow): number {
    return item.id;
  }

}
