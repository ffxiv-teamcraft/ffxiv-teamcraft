import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommissionService } from '../../../modules/commission-board/commission.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzMessageService } from 'ng-zorro-antd/message';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { CommissionBoardDisplay } from './commission-board-display';
import { ActivatedRoute } from '@angular/router';
import { AuthFacade } from '../../../+state/auth.facade';
import { map, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-commission-board',
  templateUrl: './commission-board.component.html',
  styleUrls: ['./commission-board.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommissionBoardComponent {

  public display$: Observable<CommissionBoardDisplay> = this.activatedRoute.paramMap.pipe(
    map(params => {
      const dc = params.get('dc');
      return {
        datacenter: dc,
        subscribed: localStorage.getItem(`c:fcm:${dc}`) === 'true'
      };
    }),
    switchMap(data => {
      return this.commissionsService.getByDatacenter(data.datacenter).pipe(
        map(commissions => {
          return {
            ...data,
            commissions: commissions
          }
        })
      )
    })
  );

  constructor(private commissionsService: CommissionService, private notificationsService: NzNotificationService,
              private messageService: NzMessageService, private translate: TranslateService,
              private activatedRoute: ActivatedRoute, private authFacade: AuthFacade) {
  }

  setNotifications(datacenter: string, enabled: boolean): void {
    this.commissionsService.enableNotifications(datacenter).subscribe((res) => {
      const message = res ? this.translate.instant('COMMISSIONS.Notifications_enabled') : this.translate.instant('COMMISSIONS.Notifications_enable_error');
      this.messageService.success(message);
      localStorage.setItem(`c:fcm:${datacenter}`, enabled.toString());
    });
  }

}
