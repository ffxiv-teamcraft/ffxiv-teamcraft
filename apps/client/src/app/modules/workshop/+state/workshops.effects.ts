import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import {
  CreateWorkshop,
  DeleteWorkshop,
  LoadWorkshop,
  MyWorkshopsLoaded,
  PropagateWorkshopPermissions,
  RemoveListFromWorkshop,
  SharedWorkshopsLoaded,
  UpdateWorkshop,
  UpdateWorkshopIndexes,
  WorkshopLoaded,
  WorkshopsActionTypes
} from './workshops.actions';
import { catchError, debounceTime, distinctUntilChanged, filter, map, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { AuthFacade } from '../../../+state/auth.facade';
import { TeamcraftUser } from '../../../model/user/teamcraft-user';
import { WorkshopService } from '../../../core/database/workshop.service';
import { combineLatest, of } from 'rxjs';
import { WorkshopsFacade } from './workshops.facade';
import { Workshop } from '../../../model/other/workshop';
import { PermissionLevel } from '../../../core/database/permissions/permission-level.enum';
import { PermissionsController } from '../../../core/database/permissions-controller';
import { NzMessageService } from 'ng-zorro-antd/message';
import { TranslateService } from '@ngx-translate/core';
import { FirestoreListStorage } from '../../../core/database/storage/list/firestore-list-storage';

@Injectable()
export class WorkshopsEffects {

  loadMyWorkshops$ = createEffect(() => this.actions$.pipe(
    ofType(WorkshopsActionTypes.LoadMyWorkshops),
    switchMap(() => this.authFacade.userId$),
    distinctUntilChanged(),
    switchMap((userId) => {
      return this.workshopService.getByForeignKey(TeamcraftUser, userId);
    }),
    map(workshops => new MyWorkshopsLoaded(workshops))
  ));


  loadSharedWorkshops$ = createEffect(() => this.actions$.pipe(
    ofType(WorkshopsActionTypes.LoadSharedWorkshops),
    switchMap(() => combineLatest([this.authFacade.userId$, this.authFacade.fcId$])),
    distinctUntilChanged(),
    switchMap(([userId, fcId]) => {
      // First of all, load using user Id
      return this.workshopService.getShared(userId).pipe(
        switchMap((workshops) => {
          // If we don't have fc informations yet, return the workshops directly.
          if (!fcId) {
            return of(workshops);
          }
          // Else add fc lists
          return this.workshopService.getShared(fcId).pipe(
            map(fcWorkshops => [...workshops, ...fcWorkshops])
          );
        })
      );
    }),
    map(workshops => new SharedWorkshopsLoaded(workshops))
  ));


  loadWorkshop$ = createEffect(() => this.actions$.pipe(
    ofType<LoadWorkshop>(WorkshopsActionTypes.LoadWorkshop),
    withLatestFrom(this.workshopsFacade.allWorkshops$),
    filter(([action, workshops]) => workshops.find(workshop => workshop.$key === action.key) === undefined && action.key !== undefined),
    map(([action]) => action),
    switchMap((action: LoadWorkshop) => {
      return this.authFacade.loggedIn$.pipe(
        switchMap(loggedIn => {
          return combineLatest([
            of(action.key),
            loggedIn ? this.authFacade.user$ : of(null),
            this.authFacade.userId$,
            loggedIn ? this.authFacade.fcId$ : of(null),
            this.workshopService.get(action.key).pipe(catchError(() => of(null)))
          ]);
        })
      );
    }),
    distinctUntilChanged(),
    map(([WorkshopKey, user, userId, fcId, workshop]) => {
      if (user !== null) {
        const idEntry = user.lodestoneIds.find(l => l.id === user.defaultLodestoneId);
        const verified = idEntry && idEntry.verified;
        if (!verified) {
          fcId = null;
        }
      }
      if (workshop !== null) {
        const permissionLevel = Math.max(PermissionsController.getPermissionLevel(workshop, userId), PermissionsController.getPermissionLevel(workshop, fcId));
        if (permissionLevel >= PermissionLevel.READ) {
          return [WorkshopKey, workshop];
        }
      }
      return [WorkshopKey, null];
    }),
    map(([key, workshop]: [string, Workshop]) => {
      if (workshop === null) {
        return new WorkshopLoaded({ $key: key, notFound: true });
      }
      return new WorkshopLoaded(workshop);
    })
  ));


  createWorkshopInDatabase$ = createEffect(() => this.actions$.pipe(
    ofType(WorkshopsActionTypes.CreateWorkshop),
    withLatestFrom(this.authFacade.userId$),
    map(([action, userId]) => {
      (<CreateWorkshop>action).payload.authorId = userId;
      return (<CreateWorkshop>action).payload;
    }),
    switchMap(list => this.workshopService.add(list))
  ), { dispatch: false });


  updateWorkshopInDatabase$ = createEffect(() => this.actions$.pipe(
    ofType(WorkshopsActionTypes.UpdateWorkshop),
    debounceTime(500),
    map(action => action as UpdateWorkshop),
    switchMap(action => this.workshopService.update(action.payload.$key, action.payload))
  ), { dispatch: false });


  deleteWorkshopFromDatabase$ = createEffect(() => this.actions$.pipe(
    ofType(WorkshopsActionTypes.DeleteWorkshop),
    map(action => action as DeleteWorkshop),
    switchMap(action => this.workshopService.remove(action.key))
  ), { dispatch: false });


  removeListFromWorkshop$ = createEffect(() => this.actions$.pipe(
    ofType(WorkshopsActionTypes.RemoveListFromWorkshop),
    withLatestFrom(this.workshopsFacade.allWorkshops$),
    map(([action, workshops]: [RemoveListFromWorkshop, Workshop[]]) => {
      const workshop = workshops.find(w => w.$key === action.workshopKey);
      workshop.listIds = workshop.listIds.filter(id => id !== action.listKey);
      return new UpdateWorkshop(workshop);
    })
  ));

  persistUpdateIndexes$ = createEffect(() => this.actions$.pipe(
    ofType<UpdateWorkshopIndexes>(WorkshopsActionTypes.UpdateWorkshopIndexes),
    switchMap(action => {
      return this.workshopService.updateIndexes(action.payload);
    })
  ), { dispatch: false });

  propagatePermissions$ = createEffect(() => this.actions$.pipe(
    ofType<PropagateWorkshopPermissions>(WorkshopsActionTypes.PropagateWorkshopPermissions),
    switchMap(({ workshop }) => {
      return combineLatest(workshop.listIds.map(id => {
        const registryUpdateObj = Object.keys(workshop.registry).reduce((acc, key) => {
          return {
            ...acc,
            [`registry.${key}`]: workshop.registry[key]
          };
        }, {});
        return this.listService.pureUpdate(id, {
          everyone: workshop.everyone,
          ...registryUpdateObj
        }).pipe(
          // error can happen if document is missing or you can't write to it, in both case it's fine
          catchError(() => of(null))
        );
      }));
    }),
    tap(() => this.message.success(this.translate.instant('PERMISSIONS.Propagate_changes_done')))
  ), { dispatch: false });

  constructor(
    private actions$: Actions,
    private workshopService: WorkshopService,
    private authFacade: AuthFacade,
    private workshopsFacade: WorkshopsFacade,
    private message: NzMessageService,
    private translate: TranslateService,
    private listService: FirestoreListStorage
  ) {
  }
}
