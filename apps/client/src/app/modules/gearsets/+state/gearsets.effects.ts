import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { AuthFacade } from '../../../+state/auth.facade';
import { GearsetService } from '../../../core/database/gearset.service';
import { CreateGearset, DeleteGearset, GearsetLoaded, GearsetsActionTypes, GearsetsLoaded, LoadGearset, LoadGearsets, UpdateGearset } from './gearsets.actions';
import { debounceTime, distinctUntilChanged, filter, first, map, switchMap, switchMapTo } from 'rxjs/operators';
import { TeamcraftUser } from '../../../model/user/teamcraft-user';
import { NameQuestionPopupComponent } from '../../name-question-popup/name-question-popup/name-question-popup.component';
import { TeamcraftGearset } from '../../../model/gearset/teamcraft-gearset';
import { NzModalService } from 'ng-zorro-antd';
import { TranslateService } from '@ngx-translate/core';
import { EMPTY } from 'rxjs';

@Injectable()
export class GearsetsEffects {

  @Effect()
  loadGearsets$ = this.actions$.pipe(
    ofType<LoadGearsets>(GearsetsActionTypes.LoadGearsets),
    switchMap(() => {
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
            nzContent: NameQuestionPopupComponent,
            nzFooter: null,
            nzTitle: this.translate.instant('CUSTOM_LINKS.Add_link')
          }).afterClose.pipe(
            filter(name => name),
            map(name => {
              const gearset = new TeamcraftGearset();
              gearset.name = name;
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
              private translate: TranslateService) {
  }
}
