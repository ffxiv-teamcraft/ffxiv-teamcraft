import { Injectable } from '@angular/core';
import { AngularFireMessaging } from '@angular/fire/compat/messaging';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { AngularFireFunctions } from '@angular/fire/compat/functions';
import { AuthFacade } from '../../+state/auth.facade';
import { mapTo, pairwise, startWith, switchMap } from 'rxjs/operators';
import { combineLatest, EMPTY } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { Commission } from '../../modules/commission-board/model/commission';
import { Router } from '@angular/router';
import { PlatformService } from '../tools/platform.service';

@Injectable({ providedIn: 'root' })
export class MessagingService {

  constructor(private afm: AngularFireMessaging, private afn: AngularFireFunctions,
              private notificationService: NzNotificationService, private authFacade: AuthFacade,
              private translate: TranslateService, private router: Router,
              private platform: PlatformService) {
  }

  public init(): void {


    if (!this.platform.isDesktop()) {
      this.authFacade.userId$.pipe(
        switchMap((userId) => {
          if (localStorage.getItem(`afm:${userId}`) === null) {
            localStorage.setItem(`afm:${userId}`, 'true');
            return this.afm.requestToken;
          }
          return EMPTY;
        }),
        startWith(null),
        pairwise(),
        switchMap(([previousToken, token]) => {
          if (previousToken) {
            return combineLatest([
              this.afn.httpsCallable('unsubscribeFromUserTopic')({ previousToken }),
              this.afn.httpsCallable('subscribeToUserTopic')({ token })
            ]);
          } else {
            return this.afn.httpsCallable('subscribeToUserTopic')({ token });
          }
        })
      ).subscribe();
    }

    if (!this.platform.isDesktop()) {
      this.afm.messages.pipe(
        switchMap((message: any) => {
          const commission: Commission = JSON.parse(message.data.commission);
          return this.notificationService.info(
            this.translate.instant(`COMMISSIONS.NOTIFICATIONS.${message.data.type.toUpperCase()}.Title`),
            this.translate.instant(`COMMISSIONS.NOTIFICATIONS.${message.data.type.toUpperCase()}.Content`, JSON.parse(message.data.commission)),
            {
              nzDuration: 10000
            }
          ).onClick.pipe(mapTo(commission));
        })
      ).subscribe((commission) => {
        this.router.navigate(['commission', commission.$key]);
      });
    }
  }
}
