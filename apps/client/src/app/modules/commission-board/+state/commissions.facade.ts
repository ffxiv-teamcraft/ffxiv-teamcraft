import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import * as fromCommissions from './commissions.reducer';
import * as CommissionsSelectors from './commissions.selectors';
import { createCommission, deleteCommission, loadCommission, loadUserCommissions, selectCommission, updateCommission } from './commissions.actions';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NameQuestionPopupComponent } from '../../name-question-popup/name-question-popup/name-question-popup.component';
import { distinctUntilChanged, filter, map, switchMap, withLatestFrom } from 'rxjs/operators';
import { List } from '../../list/model/list';
import { TranslateService } from '@ngx-translate/core';
import { AuthFacade } from '../../../+state/auth.facade';
import { Commission } from '../model/commission';
import { CommissionEditionPopupComponent } from '../commission-edition-popup/commission-edition-popup.component';
import { ApplyPopupComponent } from '../apply-popup/apply-popup.component';
import firebase from 'firebase/app';
import { CommissionStatus } from '../model/commission-status';
import { ListsFacade } from '../../list/+state/lists.facade';
import { PermissionLevel } from '../../../core/database/permissions/permission-level.enum';

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
          return commissions.filter(c => c.authorId === userId);
        })
      );
    })
  );

  userCommissionsAsCrafter$ = this.authFacade.userId$.pipe(
    distinctUntilChanged(),
    switchMap(userId => {
      return this.allCommissions$.pipe(
        map(commissions => {
          return commissions.filter(c => c.crafterId === userId);
        })
      );
    })
  );

  selectedCommission$ = this.store.pipe(
    select(CommissionsSelectors.getSelected)
  );

  constructor(private store: Store<fromCommissions.CommissionsPartialState>, private dialog: NzModalService,
              private translate: TranslateService, private authFacade: AuthFacade,
              private listsFacade: ListsFacade) {
  }

  create(list?: List): void {
    if (list) {
      this.store.dispatch(createCommission({ list: list, name: list.name }));
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
    this.store.dispatch(loadUserCommissions());
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
          date: firebase.firestore.Timestamp.now()
        });
        this.store.dispatch(updateCommission({ commission }));
      });
  }

  update(commission: Commission): void {
    this.store.dispatch(updateCommission({ commission }));
  }

  hire(commission: Commission, candidate: { uid: string, offer: number }): void {
    commission.status = CommissionStatus.IN_PROGRESS;
    commission.crafterId = candidate.uid;
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
    commission.status = CommissionStatus.OPENED;
    delete commission.crafterId;
    this.update(commission);
    this.listsFacade.pureUpdateList(commission.$key, {
      registry: {},
      everyone: PermissionLevel.READ,
      authorId: commission.authorId
    });
  }

  delete(key: string, deleteList = false): void {
    this.store.dispatch(deleteCommission({ key, deleteList }));
  }
}
