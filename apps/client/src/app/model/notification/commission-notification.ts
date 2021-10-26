import { AbstractNotification } from '../../core/notification/abstract-notification';
import { TranslateService } from '@ngx-translate/core';
import { I18nToolsService } from '../../core/tools/i18n-tools.service';
import { NotificationType } from '../../core/notification/notification-type';
import { Observable } from 'rxjs';

export class CommissionNotification extends AbstractNotification {

  constructor(target: string, private subType: string, private commissionName: string, public commissionId: string) {
    super(NotificationType.COMMISSION, target);
  }

  getContent(translate: TranslateService, i18nTools: I18nToolsService): Observable<string> {
    return translate.get(`COMMISSIONS.NOTIFICATIONS.${this.subType.toUpperCase()}.Content`, {
      name: this.commissionName
    });
  }

  getIcon(): string {
    return 'shop';
  }

  getTargetRoute(): string[] {
    return [`/commission/${this.commissionId}`];
  }

}
