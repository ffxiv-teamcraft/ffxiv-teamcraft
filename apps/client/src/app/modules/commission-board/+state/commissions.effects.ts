import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { AuthFacade } from '../../../+state/auth.facade';
import { CommissionService } from '../commission.service';
import { ListsFacade } from '../../list/+state/lists.facade';
import * as CommissionsActions from './commissions.actions';
import { commissionLoaded, commissionsLoaded } from './commissions.actions';
import { distinctUntilChanged, filter, first, map, switchMap, switchMapTo, tap } from 'rxjs/operators';
import { Commission } from '../model/commission';
import { LazyDataService } from '../../../core/data/lazy-data.service';
import { Character } from '@xivapi/angular-client';
import { combineLatest, of } from 'rxjs';
import { AngularFirestore } from '@angular/fire/firestore';
import { TeamcraftUser } from '../../../model/user/teamcraft-user';
import { NzModalService } from 'ng-zorro-antd/modal';
import { CommissionEditionPopupComponent } from '../commission-edition-popup/commission-edition-popup.component';
import { TranslateService } from '@ngx-translate/core';

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
          tap(commissions => {
            commissions.forEach(c => this.listsFacade.load(c.$key));
          }),
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
      switchMap((action) => {
        return this.authFacade.mainCharacter$.pipe(
          map(char => {
            return [action, char];
          }),
          first()
        );
      }),
      switchMap(([action, char]: [any, Character]) => {
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
              return [action, char, partialCommission];
            })
          );
      }),
      switchMap(([{ listKey, name }, character, partialCommission]: [any, Character, Partial<Commission>]) => {
        const commission = new Commission();
        commission.server = character.Server;
        commission.datacenter = this.lazyData.getDataCenter(character.Server);
        Object.assign(commission, partialCommission);
        if (listKey) {
          commission.$key = listKey;
          this.listsFacade.pureUpdateList(listKey, { hasCommission: true, ephemeral: false });
          return of(commission);
        }
        const list = this.listsFacade.newListWithName(name);
        list.hasCommission = true;
        list.$key = this.afs.createId();
        this.listsFacade.addList(list);
        commission.$key = list.$key;
        return of(commission);
      }),
      switchMap(commission => {
        return this.commissionService.add(commission);
      })
    );
  }, { dispatch: false });

  constructor(private actions$: Actions, private authFacade: AuthFacade,
              private commissionService: CommissionService, private listsFacade: ListsFacade,
              private lazyData: LazyDataService, private afs: AngularFirestore,
              private modalService: NzModalService, private translate: TranslateService) {
  }
}
