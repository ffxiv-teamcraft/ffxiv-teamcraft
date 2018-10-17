import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { CreateWorkshop, DeleteWorkshop, MyWorkshopsLoaded, UpdateWorkshop, WorkshopsActionTypes } from './workshops.actions';
import { debounceTime, distinctUntilChanged, map, switchMap, withLatestFrom } from 'rxjs/operators';
import { AuthFacade } from '../../../+state/auth.facade';
import { TeamcraftUser } from '../../../model/user/teamcraft-user';
import { WorkshopService } from '../../../core/database/workshop.service';
import { EMPTY } from 'rxjs';

@Injectable()
export class WorkshopsEffects {
  @Effect()
  loadMyWorkshops$ = this.actions$.pipe(
    ofType(WorkshopsActionTypes.LoadMyWorkshops),
    switchMap(() => this.authFacade.userId$),
    distinctUntilChanged(),
    switchMap((userId) => {
      return this.workshopService.getByForeignKey(TeamcraftUser, userId);
    }),
    map(workshops => new MyWorkshopsLoaded(workshops))
  );

  @Effect()
  createWorkshopInDatabase$ = this.actions$.pipe(
    ofType(WorkshopsActionTypes.CreateWorkshop),
    withLatestFrom(this.authFacade.userId$),
    map(([action, userId]) => {
      (<CreateWorkshop>action).payload.authorId = userId;
      return (<CreateWorkshop>action).payload;
    }),
    switchMap(list => this.workshopService.add(list)),
    switchMap(() => EMPTY)
  );

  @Effect()
  updateWorkshopInDatabase$ = this.actions$.pipe(
    ofType(WorkshopsActionTypes.UpdateWorkshop),
    debounceTime(500),
    map(action => action as UpdateWorkshop),
    switchMap(action => this.workshopService.update(action.payload.$key, action.payload)),
    switchMap(() => EMPTY)
  );

  @Effect()
  deleteWorkshopFromDatabase$ = this.actions$.pipe(
    ofType(WorkshopsActionTypes.DeleteWorkshop),
    map(action => action as DeleteWorkshop),
    switchMap(action => this.workshopService.remove(action.key)),
    switchMap(() => EMPTY)
  );

  constructor(
    private actions$: Actions,
    private workshopService: WorkshopService,
    private authFacade: AuthFacade
  ) {
  }
}
