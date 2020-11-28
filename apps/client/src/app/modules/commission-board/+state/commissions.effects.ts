import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { AuthFacade } from '../../../+state/auth.facade';
import { CommissionService } from '../commission.service';
import { ListsFacade } from '../../list/+state/lists.facade';
import * as CommissionsActions from './commissions.actions';
import { commissionLoaded, commissionsLoaded } from './commissions.actions';
import { distinctUntilChanged, filter, map, switchMap, switchMapTo, tap, withLatestFrom } from 'rxjs/operators';
import { Commission } from '../model/commission';
import { LazyDataService } from '../../../core/data/lazy-data.service';
import { combineLatest, of } from 'rxjs';
import { AngularFirestore } from '@angular/fire/firestore';
import { TeamcraftUser } from '../../../model/user/teamcraft-user';
import { NzModalService } from 'ng-zorro-antd/modal';
import { CommissionEditionPopupComponent } from '../commission-edition-popup/commission-edition-popup.component';
import { TranslateService } from '@ngx-translate/core';
import firebase from 'firebase/app';

@Injectable()
export class CommissionsEffects {

  loadCommissionsAsClient$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(CommissionsActions.loadUserCommissions),
      switchMapTo(this.authFacade.userId$),
      distinctUntilChanged(),
      switchMap(userId => {
        return combineLatest([this.commissionService.getByCrafterId(userId), this.commissionService.getByForeignKey(TeamcraftUser, userId)]).pipe(
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
      switchMapTo(this.authFacade.userId$),
      distinctUntilChanged(),
      switchMap((userId) => {
        return this.commissionService.get(userId).pipe(
          tap(commission => {
            this.listsFacade.load(commission.$key);
          }),
          map(commission => {
            return commissionLoaded({ commission });
          })
        );
      })
    );
  });

  updateCommission$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(CommissionsActions.updateCommission),
      switchMap(({ commission }) => {
        return this.commissionService.update(commission.$key, commission);
      })
    );
  }, { dispatch: false });

  deleteCommission$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(CommissionsActions.deleteCommission),
      switchMap(({ key, deleteList }) => {
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
        return this.modalService.create({
          nzContent: CommissionEditionPopupComponent,
          nzComponentParams: {
            name: action.name
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
        commission.items = list.finalItems.map(item => ({ id: item.id, amount: item.amount, done: item.done }));
        Object.assign(commission, partialCommission);
        if (list) {
          commission.$key = list.$key;
          this.listsFacade.pureUpdateList(list.$key, { hasCommission: true, ephemeral: false });
          return of(commission);
        }
        const newList = this.listsFacade.newListWithName(name);
        newList.hasCommission = true;
        newList.$key = this.afs.createId();
        this.listsFacade.addList(newList);
        commission.$key = newList.$key;
        return of(commission);
      }),
      switchMap(commission => {
        return this.commissionService.set(commission.$key, commission);
      })
    );
  }, { dispatch: false });

  constructor(private actions$: Actions, private authFacade: AuthFacade,
              private commissionService: CommissionService, private listsFacade: ListsFacade,
              private lazyData: LazyDataService, private afs: AngularFirestore,
              private modalService: NzModalService, private translate: TranslateService) {
  }
}
