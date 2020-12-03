import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { Commission } from '../model/commission';
import { Router } from '@angular/router';
import { ListRow } from '../../list/model/list-row';
import { TranslateService } from '@ngx-translate/core';
import { CommissionStatus } from '../model/commission-status';
import { AuthFacade } from '../../../+state/auth.facade';
import { Observable } from 'rxjs';
import { CommissionsFacade } from '../+state/commissions.facade';
import { NotificationType } from '../../../core/notification/notification-type';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-commission-panel',
  templateUrl: './commission-panel.component.html',
  styleUrls: ['./commission-panel.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommissionPanelComponent implements OnInit {

  CommissionStatus = CommissionStatus;

  @Input()
  commission: Commission;

  @Input()
  showStatus = true;

  now = Date.now();

  hasNotifications$: Observable<boolean>;

  public userId$: Observable<string> = this.authFacade.userId$;

  constructor(private router: Router, public translate: TranslateService,
              private authFacade: AuthFacade, public commissionsFacade: CommissionsFacade) {
  }

  openCommission(): void {
    this.router.navigate(['/commissions/', this.commission.$key]);
  }

  bumpCommission(): void {
    this.commissionsFacade.bump(this.commission);
  }

  deleteCommission(withLists: boolean): void {
    this.commissionsFacade.delete(this.commission.$key, withLists);
  }

  editCommission(): void {
    this.commissionsFacade.edit(this.commission);
  }

  trackByItem(index: number, item: ListRow): number {
    return item.id;
  }

  ngOnInit(): void {
    this.hasNotifications$ = this.commissionsFacade.notifications$.pipe(
      map(notifications => {
        return notifications.some(n => n.type === NotificationType.COMMISSION && (<any>n).commissionId === this.commission.$key);
      })
    );
  }

}
