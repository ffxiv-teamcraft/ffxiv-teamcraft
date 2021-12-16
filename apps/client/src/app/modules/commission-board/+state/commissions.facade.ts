import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import * as fromCommissions from './commissions.reducer';
import * as CommissionsSelectors from './commissions.selectors';
import { createCommission, deleteCommission, loadCommission, loadUserCommissions, selectCommission, updateCommission } from './commissions.actions';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NameQuestionPopupComponent } from '../../name-question-popup/name-question-popup/name-question-popup.component';
import { distinctUntilChanged, filter, map, switchMap, switchMapTo, withLatestFrom } from 'rxjs/operators';
import { List } from '../../list/model/list';
import { TranslateService } from '@ngx-translate/core';
import { AuthFacade } from '../../../+state/auth.facade';
import { Commission } from '../model/commission';
import { CommissionEditionPopupComponent } from '../commission-edition-popup/commission-edition-popup.component';
import { ApplyPopupComponent } from '../apply-popup/apply-popup.component';
import firebase from 'firebase/compat/app';
import { CommissionStatus } from '../model/commission-status';
import { ListsFacade } from '../../list/+state/lists.facade';
import { PermissionLevel } from '../../../core/database/permissions/permission-level.enum';
import { CommissionRatingPopupComponent } from '../commission-rating-popup/commission-rating-popup.component';
import { FiredFeedbackPopupComponent } from '../fired-feedback-popup/fired-feedback-popup.component';
import { ResignedFeedbackPopupComponent } from '../resigned-feedback-popup/resigned-feedback-popup.component';
import { CommissionProfileService } from '../../../core/database/commission-profile.service';
import { NotificationType } from '../../../core/notification/notification-type';
import { NotificationsFacade } from '../../notifications/+state/notifications.facade';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CommissionsFacade {
  loaded$ = this.store.pipe(select(CommissionsSelectors.getCommissionsLoaded));

  allCommissions$ = this.store.pipe(
    select(CommissionsSelectors.getAllCommissions)
  );

  userCommissionsAsClient$ = this.authFacade.userId$.pipe(
    distinctUntilChanged(),
    switchMap(userId => {
      return this.allCommissions$.pipe(
        map(commissions => {
          return commissions.filter(c => c.authorId === userId && c.status !== CommissionStatus.ARCHIVED);
        })
      );
    })
  );

  userCommissionsAsCrafter$ = this.authFacade.userId$.pipe(
    distinctUntilChanged(),
    switchMap(userId => {
      return this.allCommissions$.pipe(
        map(commissions => {
          return commissions.filter(c => c.crafterId === userId && c.status !== CommissionStatus.ARCHIVED);
        })
      );
    })
  );

  userArchivedCommissionsAsClient$ = this.authFacade.userId$.pipe(
    distinctUntilChanged(),
    switchMap(userId => {
      return this.allCommissions$.pipe(
        map(commissions => {
          return commissions.filter(c => c.authorId === userId && c.status === CommissionStatus.ARCHIVED);
        })
      );
    })
  );

  userArchivedCommissionsAsCrafter$ = this.authFacade.userId$.pipe(
    distinctUntilChanged(),
    switchMap(userId => {
      return this.allCommissions$.pipe(
        map(commissions => {
          return commissions.filter(c => c.crafterId === userId && c.status === CommissionStatus.ARCHIVED);
        })
      );
    })
  );

  selectedCommission$ = this.store.pipe(
    select(CommissionsSelectors.getSelected)
  );

  notifications$ = this.notificationsFacade.loaded$.pipe(
    filter(loaded => loaded),
    switchMapTo(this.notificationsFacade.notificationsDisplay$),
    map(notifications => {
      return notifications.filter(n => n.type === NotificationType.COMMISSION);
    })
  );

  constructor(private store: Store<fromCommissions.CommissionsPartialState>, private dialog: NzModalService,
              private translate: TranslateService, private authFacade: AuthFacade,
              private listsFacade: ListsFacade, private commissionProfileService: CommissionProfileService,
              private notificationsFacade: NotificationsFacade) {
  }

  create(list?: List, template?: Partial<Commission>): void {
    if (list) {
      this.store.dispatch(createCommission({ list: list, name: list.name, template }));
    } else {
      this.dialog.create({
        nzContent: NameQuestionPopupComponent,
        nzFooter: null,
        nzTitle: this.translate.instant('COMMISSIONS.New_commission')
      }).afterClose.pipe(
        filter(res => res && res.length > 0)
      ).subscribe(res => {
        this.store.dispatch(createCommission({ name: res }));
      });
    }
  }

  loadAll(): void {
    this.store.dispatch(loadUserCommissions({ archived: false }));
  }

  loadArchived(): void {
    this.store.dispatch(loadUserCommissions({ archived: true }));
  }

  load(key: string): void {
    this.store.dispatch(loadCommission({ key }));
  }

  select(key: string): void {
    this.store.dispatch(selectCommission({ key }));
  }

  edit(commission: Commission): void {
    this.dialog.create({
      nzContent: CommissionEditionPopupComponent,
      nzComponentParams: {
        commission: commission
      },
      nzFooter: null,
      nzTitle: this.translate.instant('COMMISSIONS.New_commission')
    }).afterClose
      .pipe(
        filter(c => !!c)
      )
      .subscribe(patch => {
        Object.assign(commission, patch);
        this.store.dispatch(updateCommission({ commission }));
      });
  }

  apply(commission: Commission): void {
    this.dialog.create({
      nzContent: ApplyPopupComponent,
      nzComponentParams: {
        price: commission.price
      },
      nzFooter: null,
      nzTitle: this.translate.instant('COMMISSIONS.DETAILS.Apply')
    }).afterClose
      .pipe(
        filter(c => !!c),
        withLatestFrom(this.authFacade.userId$)
      )
      .subscribe(([res, userId]) => {
        commission.candidates.push({
          offer: res.price,
          uid: userId,
          date: firebase.firestore.Timestamp.now(),
          contact: res.contactInformations
        });
        this.store.dispatch(updateCommission({ commission }));
      });
  }

  update(commission: Commission): void {
    this.store.dispatch(updateCommission({ commission }));
  }

  hire(commission: Commission, candidate: { uid: string, offer: number, contact: string }): void {
    commission.status = CommissionStatus.IN_PROGRESS;
    commission.crafterId = candidate.uid;
    commission.crafterContact = candidate.contact;
    commission.price = candidate.offer;
    commission.candidates = commission.candidates.filter(c => c.uid !== candidate.uid);
    this.update(commission);
    this.listsFacade.pureUpdateList(commission.$key, {
      registry: {},
      everyone: PermissionLevel.READ,
      authorId: candidate.uid
    });
  }

  fireContractor(commission: Commission): void {
    this.dialog.create({
      nzContent: FiredFeedbackPopupComponent,
      nzFooter: null
    }).afterClose
      .pipe(
        filter(reason => !!reason),
        switchMap(reason => {
          return this.commissionProfileService.addFiredFeedback(commission.crafterId, commission.$key, reason);
        })
      )
      .subscribe(() => {
        this.removeCrafterFromCommission(commission);
      });
  }

  resignContractor(commission: Commission): void {
    this.dialog.create({
      nzContent: ResignedFeedbackPopupComponent,
      nzFooter: null
    }).afterClose
      .pipe(
        filter(reason => !!reason),
        switchMap(reason => {
          return this.commissionProfileService.addResignedFeedback(commission.crafterId, commission.$key, reason);
        })
      )
      .subscribe(() => {
        this.removeCrafterFromCommission(commission);
      });
  }

  markAsCompleted(commission: Commission): void {
    this.listsFacade.pureUpdateList(commission.$key, {
      registry: {},
      everyone: PermissionLevel.READ,
      authorId: null
    });
  }

  rate(commission: Commission, authorId: string): Observable<boolean> {
    return this.dialog.create({
      nzContent: CommissionRatingPopupComponent,
      nzComponentParams: {
        commission,
        authorId
      },
      nzFooter: null,
      nzTitle: this.translate.instant('COMMISSIONS.DETAILS.Rate_commission')
    }).afterClose
      .pipe(
        map((res) => {
          if (res) {
            commission.ratings[authorId] = res;
            this.store.dispatch(updateCommission({ commission }));
          }
          return !!res;
        })
      );
  }

  bump(commission: Commission): void {
    commission.bump = firebase.firestore.Timestamp.now();
    this.store.dispatch(updateCommission({ commission }));
  }

  delete(key: string, deleteList = false): void {
    this.store.dispatch(deleteCommission({ key, deleteList }));
  }

  private removeCrafterFromCommission(commission: Commission): void {
    commission.status = CommissionStatus.OPENED;
    commission.crafterId = null;
    this.update(commission);
    this.listsFacade.pureUpdateList(commission.$key, {
      registry: {},
      everyone: PermissionLevel.READ,
      authorId: commission.authorId
    });
  }
}
