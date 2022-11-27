import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';

import { distinctUntilChanged, map, switchMap, withLatestFrom } from 'rxjs/operators';
import * as ListAggregatesActions from './list-aggregates.actions';
import { listAggregateLoaded, selectListAggregate } from './list-aggregates.actions';
import { ListAggregatesService } from '../../../core/database/list-aggregates.service';
import { AuthFacade } from '../../../+state/auth.facade';
import { TeamcraftUser } from '../../../model/user/teamcraft-user';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class ListAggregatesEffects {


  loadListAggregates$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ListAggregatesActions.loadListAggregates),
      switchMap(() => {
        return this.authFacade.userId$.pipe(
          distinctUntilChanged(),
          switchMap(id => {
            return this.service.getByForeignKey(TeamcraftUser, id);
          })
        );
      }),
      map(aggregates => ListAggregatesActions.listAggregatesLoaded({ aggregates }))
    );
  });

  loadListAggregate$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ListAggregatesActions.loadListAggregate),
      switchMap(({ id }) => {
        return this.service.get(id);
      }),
      map(aggregate => {
        return listAggregateLoaded({ aggregate });
      })
    )
  );

  createListAggregate$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ListAggregatesActions.createListAggregate),
      withLatestFrom(this.authFacade.userId$),
      switchMap(([action, userId]) => {
        action.aggregate.authorId = userId;
        return this.service.add(action.aggregate);
      }),
      map(key => {
        this.router.navigate(['list-aggregate', 'saved', key]);
        this.message.success(this.translate.instant('LIST_AGGREGATE.Saved'));
        return selectListAggregate({ id: key });
      })
    )
  );

  updateListAggregate$ = createEffect(() =>
      this.actions$.pipe(
        ofType(ListAggregatesActions.updateListAggregate),
        switchMap(action => {
          return this.service.set(action.aggregate.$key, action.aggregate);
        })
      ),
    { dispatch: false }
  );

  pureUpdateListAggregate$ = createEffect(() =>
      this.actions$.pipe(
        ofType(ListAggregatesActions.pureUpdateListAggregate),
        switchMap(action => {
          return this.service.pureUpdate(action.$key, action.update);
        })
      ),
    { dispatch: false }
  );

  deleteListAggregate$ = createEffect(() =>
      this.actions$.pipe(
        ofType(ListAggregatesActions.deleteListAggregate),
        switchMap(action => {
          return this.service.remove(action.id);
        })
      ),
    { dispatch: false }
  );

  constructor(private actions$: Actions, private service: ListAggregatesService,
              private authFacade: AuthFacade, private router: Router, private message: NzMessageService,
              private translate: TranslateService) {
  }
}
