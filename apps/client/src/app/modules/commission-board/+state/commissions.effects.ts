import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { AuthFacade } from '../../../+state/auth.facade';
import { CommissionService } from '../commission.service';
import { ListsFacade } from '../../list/+state/lists.facade';
import * as CommissionsActions from './commissions.actions';
import { first, map, switchMap } from 'rxjs/operators';
import { Commission } from '../model/commission';
import { LazyDataService } from '../../../core/data/lazy-data.service';
import { Character } from '@xivapi/angular-client';
import { of } from 'rxjs';
import { AngularFirestore } from '@angular/fire/firestore';

@Injectable()
export class CommissionsEffects {

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
      switchMap(([{ listKey, name }, character]: [any, Character]) => {
        const commission = new Commission();
        commission.server = character.Server;
        commission.dataCenter = this.lazyData.getDataCenter(character.Server);
        commission.name = name;
        if (listKey) {
          commission.$key = listKey;
          return of(commission);
        }
        const list = this.listsFacade.newListWithName(name);
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
              private lazyData: LazyDataService, private afs: AngularFirestore) {
  }
}
