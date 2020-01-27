import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { AuthFacade } from '../../../+state/auth.facade';
import { GearsetService } from '../../../core/database/gearset.service';
import {
  CreateGearset,
  DeleteGearset,
  GearsetLoaded,
  GearsetsActionTypes,
  GearsetsLoaded,
  ImportGearset,
  LoadGearset,
  LoadGearsets,
  UpdateGearset
} from './gearsets.actions';
import { debounceTime, distinctUntilChanged, exhaustMap, filter, first, map, switchMap, switchMapTo, tap } from 'rxjs/operators';
import { TeamcraftUser } from '../../../model/user/teamcraft-user';
import { TeamcraftGearset } from '../../../model/gearset/teamcraft-gearset';
import { NzModalService } from 'ng-zorro-antd';
import { TranslateService } from '@ngx-translate/core';
import { EMPTY } from 'rxjs';
import { GearsetCreationPopupComponent } from '../gearset-creation-popup/gearset-creation-popup.component';
import { Router } from '@angular/router';
import { AriyalaImportPopupComponent } from '../ariyala-import-popup/ariyala-import-popup.component';

@Injectable()
export class GearsetsEffects {

  @Effect()
  loadGearsets$ = this.actions$.pipe(
    ofType<LoadGearsets>(GearsetsActionTypes.LoadGearsets),
    exhaustMap(() => {
      return this.authFacade.userId$.pipe(
        distinctUntilChanged(),
        switchMap(userId => {
          return this.gearsetService.getByForeignKey(TeamcraftUser, userId);
        })
      );
    }),
    map(sets => new GearsetsLoaded(sets))
  );

  @Effect()
  loadGearset$ = this.actions$.pipe(
    ofType<LoadGearset>(GearsetsActionTypes.LoadGearset),
    switchMap(action => {
      return this.gearsetService.get(action.key);
    }),
    map(gearset => new GearsetLoaded(gearset))
  );

  @Effect({
    dispatch: false
  })
  createGearset$ = this.actions$.pipe(
    ofType<CreateGearset>(GearsetsActionTypes.CreateGearset),
    switchMap(() => {
      return this.authFacade.userId$.pipe(
        first(),
        switchMap(userId => {
          return this.dialog.create({
            nzContent: GearsetCreationPopupComponent,
            nzFooter: null,
            nzTitle: this.translate.instant('GEARSETS.New_gearset')
          }).afterClose.pipe(
            filter(opts => opts),
            map(opts => {
              const gearset = new TeamcraftGearset();
              gearset.name = opts.name;
              gearset.job = opts.job;
              gearset.authorId = userId;
              return gearset;
            })
          );
        }),
        switchMap(gearset => {
          return this.gearsetService.add(gearset);
        })
      );
    }),
    tap((res) => {
      this.router.navigate(['/gearset', res, 'edit']);
    }),
    switchMapTo(EMPTY)
  );

  @Effect({
    dispatch: false
  })
  importGearset$ = this.actions$.pipe(
    ofType<ImportGearset>(GearsetsActionTypes.ImportGearset),
    switchMap(() => {
      return this.authFacade.userId$.pipe(
        first(),
        switchMap(userId => {
          return this.dialog.create({
            nzContent: AriyalaImportPopupComponent,
            nzFooter: null,
            nzTitle: this.translate.instant('GEARSETS.Import_from_ariyala')
          }).afterClose.pipe(
            filter(opts => opts),
            map((gearset) => {
              gearset.authorId = userId;
              return gearset;
            })
          );
        }),
        switchMap(gearset => {
          return this.gearsetService.add(gearset);
        })
      );
    }),
    tap((res) => {
      this.router.navigate(['/gearset', res, 'edit']);
    }),
    switchMapTo(EMPTY)
  );

  @Effect({
    dispatch: false
  })
  updateGearset$ = this.actions$.pipe(
    ofType<UpdateGearset>(GearsetsActionTypes.UpdateGearset),
    debounceTime(2000),
    switchMap(action => {
      return this.gearsetService.update(action.key, action.gearset);
    })
  );

  @Effect({
    dispatch: false
  })
  deleteGearset$ = this.actions$.pipe(
    ofType<DeleteGearset>(GearsetsActionTypes.DeleteGearset),
    switchMap(action => {
      return this.gearsetService.remove(action.key);
    })
  );

  constructor(private actions$: Actions, private authFacade: AuthFacade,
              private gearsetService: GearsetService, private dialog: NzModalService,
              private translate: TranslateService, private router: Router) {
  }
}
