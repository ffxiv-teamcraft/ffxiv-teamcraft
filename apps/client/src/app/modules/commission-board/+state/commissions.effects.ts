import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { AuthFacade } from '../../../+state/auth.facade';
import { CommissionService } from '../commission.service';
import { ListsFacade } from '../../list/+state/lists.facade';
import * as CommissionsActions from './commissions.actions';
import { commissionLoaded, commissionsLoaded } from './commissions.actions';
import { distinctUntilChanged, filter, map, mergeMap, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { Commission } from '../model/commission';
import { LazyDataService } from '../../../core/data/lazy-data.service';
import { combineLatest, of } from 'rxjs';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { NzModalService } from 'ng-zorro-antd/modal';
import { CommissionEditionPopupComponent } from '../commission-edition-popup/commission-edition-popup.component';
import { TranslateService } from '@ngx-translate/core';
import firebase from 'firebase/compat/app';
import { Router } from '@angular/router';
import { PermissionLevel } from '../../../core/database/permissions/permission-level.enum';

@Injectable()
export class CommissionsEffects {

  loadUserCommissions$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(CommissionsActions.loadUserCommissions),
      switchMap(({ archived }) => this.authFacade.userId$.pipe(
        distinctUntilChanged(),
        map(userId => ([userId, archived]))
      )),
      mergeMap(([userId, archived]: [string, boolean]) => {
        return combineLatest([
          this.commissionService.getByCrafterId(userId, archived),
          this.commissionService.getByClientId(userId, archived)
        ]).pipe(
          map(([crafter, client]) => [...crafter, ...client]),
          map(commissions => {
            return commissionsLoaded({ commissions, userId });
          })
        );
      })
    );
  });

  loadCommission$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(CommissionsActions.loadCommission),
      mergeMap(({ key }) => {
        return this.commissionService.get(key);
      }),
      map(commission => {
        return commissionLoaded({ commission });
      })
    );
  });

  updateCommission$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(CommissionsActions.updateCommission),
      mergeMap(({ commission }) => {
        return this.commissionService.update(commission.$key, commission);
      })
    );
  }, { dispatch: false });

  deleteCommission$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(CommissionsActions.deleteCommission),
      mergeMap(({ key, deleteList }) => {
        if (deleteList) {
          return combineLatest([this.commissionService.remove(key), this.listsFacade.deleteList(key, false)]);
        } else {
          return combineLatest([this.commissionService.remove(key), this.listsFacade.pureUpdateList(key, { hasCommission: false })]);
        }
      })
    );
  }, { dispatch: false });

  createCommission$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(CommissionsActions.createCommission),
      withLatestFrom(this.authFacade.mainCharacter$, this.authFacade.userId$),
      switchMap(([action, char, userId]) => {
        const formData = action.template || {
          name: action.name,
          items: action.list?.finalItems?.map(item => {
            return {
              amount: item.amount,
              done: 0,
              id: item.id
            };
          })
        };
        return this.modalService.create({
          nzContent: CommissionEditionPopupComponent,
          nzComponentParams: {
            commission: formData
          },
          nzFooter: null,
          nzTitle: this.translate.instant('COMMISSIONS.New_commission')
        }).afterClose
          .pipe(
            filter(data => !!data),
            map(partialCommission => {
              return [action, char, userId, partialCommission];
            })
          );
      }),
      switchMap(([{ list, name }, character, userId, partialCommission]) => {
        const commission = new Commission();
        commission.authorId = userId;
        commission.server = character.Server;
        commission.datacenter = this.lazyData.getDataCenter(character.Server);
        commission.createdAt = firebase.firestore.Timestamp.now();
        commission.bump = firebase.firestore.Timestamp.now();
        Object.assign(commission, partialCommission);
        if (list) {
          commission.$key = list.$key;
          commission.items = list.finalItems.map(item => ({ id: item.id, amount: item.amount, done: item.done }));
          commission.totalItems = commission.items.reduce((acc, item) => acc + item.amount, 0);
          this.listsFacade.pureUpdateList(list.$key, { hasCommission: true, ephemeral: false, everyone: PermissionLevel.READ });
          return of(commission);
        }
        const newList = this.listsFacade.newListWithName(name);
        newList.hasCommission = true;
        newList.everyone = PermissionLevel.READ;
        newList.$key = this.afs.createId();
        this.listsFacade.addList(newList);
        commission.$key = newList.$key;
        return of(commission);
      }),
      switchMap(commission => {
        return this.commissionService.set(commission.$key, commission).pipe(
          tap(() => {
            this.router.navigate(['commission', commission.$key]);
          })
        );
      })
    );
  }, { dispatch: false });

  constructor(private actions$: Actions, private authFacade: AuthFacade,
              private commissionService: CommissionService, private listsFacade: ListsFacade,
              private lazyData: LazyDataService, private afs: AngularFirestore,
              private modalService: NzModalService, private translate: TranslateService,
              private router: Router) {
  }
}
