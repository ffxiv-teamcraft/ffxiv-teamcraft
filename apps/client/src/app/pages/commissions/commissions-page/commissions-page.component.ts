import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CommissionsFacade } from '../../../modules/commission-board/+state/commissions.facade';
import { combineLatest } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';
import { NotificationsFacade } from '../../../modules/notifications/+state/notifications.facade';
import { TranslateModule } from '@ngx-translate/core';
import { PageLoaderComponent } from '../../../modules/page-loader/page-loader/page-loader.component';
import { CommissionPanelComponent } from '../../../modules/commission-board/commission-panel/commission-panel.component';
import { FullpageMessageComponent } from '../../../modules/fullpage-message/fullpage-message/fullpage-message.component';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NgIf, NgFor, AsyncPipe } from '@angular/common';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzWaveModule } from 'ng-zorro-antd/core/wave';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { FlexModule } from '@angular/flex-layout/flex';

@Component({
    selector: 'app-commissions-page',
    templateUrl: './commissions-page.component.html',
    styleUrls: ['./commissions-page.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [FlexModule, NzButtonModule, NzWaveModule, NzToolTipModule, NzIconModule, NgIf, NzAlertModule, NgFor, NzDividerModule, FullpageMessageComponent, CommissionPanelComponent, PageLoaderComponent, AsyncPipe, TranslateModule]
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
