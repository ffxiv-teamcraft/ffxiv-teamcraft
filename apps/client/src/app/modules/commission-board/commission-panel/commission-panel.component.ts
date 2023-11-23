import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { Commission } from '../model/commission';
import { Router, RouterLink } from '@angular/router';
import { ListRow } from '../../list/model/list-row';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { CommissionStatus } from '../model/commission-status';
import { AuthFacade } from '../../../+state/auth.facade';
import { Observable } from 'rxjs';
import { CommissionsFacade } from '../+state/commissions.facade';
import { NotificationType } from '../../../core/notification/notification-type';
import { map } from 'rxjs/operators';
import { SettingsService } from '../../settings/settings.service';
import { I18nPipe } from '../../../core/i18n.pipe';
import { TeamcraftLinkPipe } from '../../../pipes/pipes/teamcraft-link.pipe';
import { ItemNamePipe } from '../../../pipes/pipes/item-name.pipe';
import { LazyScrollComponent } from '../../lazy-scroll/lazy-scroll/lazy-scroll.component';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { ClipboardDirective } from '../../../core/clipboard.directive';
import { NzWaveModule } from 'ng-zorro-antd/core/wave';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { ItemIconComponent } from '../../item-icon/item-icon/item-icon.component';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NgIf, NgSwitch, NgSwitchCase, NgFor, AsyncPipe, DecimalPipe, DatePipe } from '@angular/common';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { UserAvatarComponent } from '../../user-avatar/user-avatar/user-avatar.component';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { FlexModule } from '@angular/flex-layout/flex';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';

@Component({
    selector: 'app-commission-panel',
    templateUrl: './commission-panel.component.html',
    styleUrls: ['./commission-panel.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NzCollapseModule, FlexModule, NzGridModule, UserAvatarComponent, NzBadgeModule, NgIf, NgSwitch, NgSwitchCase, NzTagModule, NzToolTipModule, NgFor, ItemIconComponent, NzButtonModule, NzWaveModule, ClipboardDirective, NzIconModule, RouterLink, NzDropDownModule, NzMenuModule, NzPopconfirmModule, LazyScrollComponent, AsyncPipe, DecimalPipe, DatePipe, TranslateModule, ItemNamePipe, TeamcraftLinkPipe, I18nPipe]
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
              private authFacade: AuthFacade, public commissionsFacade: CommissionsFacade,
              public settings: SettingsService) {
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
