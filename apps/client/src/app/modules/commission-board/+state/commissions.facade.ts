import { Injectable } from '@angular/core';

import { select, Store } from '@ngrx/store';

import * as fromCommissions from './commissions.reducer';
import * as CommissionsSelectors from './commissions.selectors';
import { createCommission } from './commissions.actions';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NameQuestionPopupComponent } from '../../name-question-popup/name-question-popup/name-question-popup.component';
import { distinctUntilChanged, filter, map, switchMap } from 'rxjs/operators';
import { List } from '../../list/model/list';
import { TranslateService } from '@ngx-translate/core';
import { AuthFacade } from '../../../+state/auth.facade';

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
              private translate: TranslateService, private authFacade: AuthFacade) {
  }

  create(list?: List): void {
    if (list) {
      this.store.dispatch(createCommission({ listKey: list.$key, name: list.name }));
    } else {
      this.dialog.create({
        nzContent: NameQuestionPopupComponent,
        nzFooter: null,
        nzTitle: this.translate.instant('COMMISSIONS.New_commission')
      }).afterClose.pipe(
        filter(res => res && res.name !== undefined)
      ).subscribe(res => {
        this.store.dispatch(createCommission({ name: res }));
      });
    }
  }
}
