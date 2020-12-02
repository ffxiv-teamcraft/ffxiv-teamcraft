import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CommissionsFacade } from '../../../modules/commission-board/+state/commissions.facade';
import { combineLatest } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';
import { NotificationsFacade } from '../../../modules/notifications/+state/notifications.facade';

@Component({
  selector: 'app-commissions-page',
  templateUrl: './commissions-page.component.html',
  styleUrls: ['./commissions-page.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommissionsPageComponent implements OnInit {

  public display$ = this.commissionsFacade.loaded$.pipe(
    filter(loaded => loaded),
    switchMap(() => {
      return combineLatest([
        this.commissionsFacade.userCommissionsAsClient$,
        this.commissionsFacade.userCommissionsAsCrafter$
      ]).pipe(
        map(([commissionsAsClient, commissionsAsCrafter]) => {
          return {
            commissionsAsClient,
            commissionsAsCrafter
          };
        })
      );
    })
  );

  public notifications$ = this.commissionsFacade.notifications$;

  constructor(private commissionsFacade: CommissionsFacade, private notificationsFacade: NotificationsFacade) {
  }

  removeNotifications(): void {
    this.notificationsFacade.removeCommissionNotifications(() => true);
  }

  createCommission(): void {
    this.commissionsFacade.create();
  }

  ngOnInit(): void {
    this.commissionsFacade.loadAll();
  }

}
