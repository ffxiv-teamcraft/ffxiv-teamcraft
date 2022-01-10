import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { AuthFacade } from '../../../+state/auth.facade';
import { GearsetService } from '../../../core/database/gearset.service';
import {
  CreateGearset,
  DeleteGearset,
  GearsetLoaded,
  GearsetProgressionLoaded,
  GearsetsActionTypes,
  GearsetsLoaded,
  ImportAriyalaGearset,
  ImportFromPcap,
  ImportLodestoneGearset,
  LoadGearset,
  LoadGearsetProgression,
  LoadGearsets,
  PureUpdateGearset,
  SaveGearsetProgression,
  SyncFromPcap,
  UpdateGearset,
  UpdateGearsetIndexes
} from './gearsets.actions';
import { catchError, debounceTime, distinctUntilChanged, exhaustMap, filter, first, map, mergeMap, switchMap, switchMapTo, tap } from 'rxjs/operators';
import { TeamcraftUser } from '../../../model/user/teamcraft-user';
import { TeamcraftGearset } from '../../../model/gearset/teamcraft-gearset';
import { NzModalService } from 'ng-zorro-antd/modal';
import { TranslateService } from '@ngx-translate/core';
import { EMPTY, of } from 'rxjs';
import { GearsetCreationPopupComponent } from '../gearset-creation-popup/gearset-creation-popup.component';
import { Router } from '@angular/router';
import { AriyalaImportPopupComponent } from '../ariyala-import-popup/ariyala-import-popup.component';
import { LodestoneImportPopupComponent } from '../lodestone-import-popup/lodestone-import-popup.component';
import { ImportFromPcapPopupComponent } from '../import-from-pcap-popup/import-from-pcap-popup.component';
import { onlyIfNotConnected } from '../../../core/rxjs/only-if-not-connected';
import { GearsetsFacade } from './gearsets.facade';
import { GearsetProgression, newEmptyProgression } from '../../../model/gearset/gearset-progression';
import { SyncFromPcapPopupComponent } from '../sync-from-pcap-popup/sync-from-pcap-popup.component';
import { EtroImportPopupComponent } from '../etro-import-popup/etro-import-popup.component';

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
    onlyIfNotConnected(this.gearsetsFacade.allGearsets$, action => action.key),
    mergeMap(action => {
      return this.gearsetService.get(action.key)
        .pipe(catchError(() => of({ $key: action.key, notFound: true } as TeamcraftGearset)));
    }),
    map(gearset => new GearsetLoaded(gearset))
  );

  @Effect()
  loadGearsetProgression$ = this.actions$.pipe(
    ofType<LoadGearsetProgression>(GearsetsActionTypes.LoadGearsetProgression),
    map(action => {
      const rawString = localStorage.getItem(`gp:${action.key}`);
      let res: GearsetProgression;
      if (rawString) {
        res = JSON.parse(rawString);
      } else {
        res = newEmptyProgression();
      }
      return new GearsetProgressionLoaded(action.key, res);
    })
  );

  @Effect({ dispatch: false })
  saveGearsetProgression$ = this.actions$.pipe(
    ofType<SaveGearsetProgression>(GearsetsActionTypes.SaveGearsetProgression),
    map(action => {
      localStorage.setItem(`gp:${action.key}`, JSON.stringify(action.progression));
    })
  );

  @Effect({
    dispatch: false
  })
  updateIndexes$ = this.actions$.pipe(
    ofType<UpdateGearsetIndexes>(GearsetsActionTypes.UpdateGearsetIndexes),
    switchMap(action => {
      return this.gearsetService.updateIndexes(action.payload);
    })
  );

  @Effect({
    dispatch: false
  })
  createGearset$ = this.actions$.pipe(
    ofType<CreateGearset>(GearsetsActionTypes.CreateGearset),
    switchMap((action: CreateGearset) => {
      return this.authFacade.userId$.pipe(
        first(),
        switchMap(userId => {
          if (action.gearset) {
            action.gearset.authorId = userId;
            return of(action.gearset);
          } else {
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
          }
        }),
        switchMap(gearset => {
          return this.gearsetService.add(gearset).pipe(
            tap((res) => {
              if (!action.preventNavigation) {
                this.router.navigate(['/gearset', res, 'edit']);
              }
            })
          );
        })
      );
    }),
    switchMapTo(EMPTY)
  );

  @Effect({
    dispatch: false
  })
  importAriyalaGearset$ = this.actions$.pipe(
    ofType<ImportAriyalaGearset>(GearsetsActionTypes.ImportAriyalaGearset),
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
      this.router.navigate(['/gearset', res]);
    }),
    switchMapTo(EMPTY)
  );

  @Effect({
    dispatch: false
  })
  importEtroGearset$ = this.actions$.pipe(
    ofType<ImportAriyalaGearset>(GearsetsActionTypes.ImportEtroGearset),
    switchMap(() => {
      return this.authFacade.userId$.pipe(
        first(),
        switchMap(userId => {
          return this.dialog.create({
            nzContent: EtroImportPopupComponent,
            nzFooter: null,
            nzTitle: this.translate.instant('GEARSETS.Import_from_etro')
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
      this.router.navigate(['/gearset', res]);
    }),
    switchMapTo(EMPTY)
  );


  @Effect({
    dispatch: false
  })
  importFrompcap$ = this.actions$.pipe(
    ofType<ImportFromPcap>(GearsetsActionTypes.ImportFromPcap),
    switchMap(() => {
      return this.authFacade.userId$.pipe(
        first(),
        switchMap(userId => {
          return this.dialog.create({
            nzContent: ImportFromPcapPopupComponent,
            nzFooter: null,
            nzTitle: this.translate.instant('GEARSETS.Import_using_pcap')
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
      this.router.navigate(['/gearset', res]);
    }),
    switchMapTo(EMPTY)
  );


  @Effect({
    dispatch: false
  })
  syncFromPcap$ = this.actions$.pipe(
    ofType<SyncFromPcap>(GearsetsActionTypes.SyncFromPcap),
    switchMap(() => {
      return this.dialog.create({
        nzContent: SyncFromPcapPopupComponent,
        nzFooter: null,
        nzTitle: this.translate.instant('GEARSETS.SYNC.Title')
      }).afterClose;
    })
  );

  @Effect({
    dispatch: false
  })
  importLodestoneGearset$ = this.actions$.pipe(
    ofType<ImportLodestoneGearset>(GearsetsActionTypes.ImportLodestoneGearset),
    switchMap(() => {
      return this.authFacade.userId$.pipe(
        first(),
        switchMap(userId => {
          return this.dialog.create({
            nzContent: LodestoneImportPopupComponent,
            nzFooter: null,
            nzTitle: this.translate.instant('GEARSETS.Import_from_lodestone')
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
    debounceTime(500),
    filter(action => !action.isReadonly),
    switchMap(action => {
      return this.gearsetService.update(action.key, action.gearset);
    })
  );

  @Effect({
    dispatch: false
  })
  pureUpdateGearset = this.actions$.pipe(
    ofType<PureUpdateGearset>(GearsetsActionTypes.PureUpdateGearset),
    switchMap(action => {
      return this.gearsetService.pureUpdate(action.key, action.gearset);
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
              private translate: TranslateService, private router: Router,
              private gearsetsFacade: GearsetsFacade) {
  }
}
