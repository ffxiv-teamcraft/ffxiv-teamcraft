import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as FreeCompanyWorkshopActions from './free-company-workshop.actions';
import * as FreeCompanyWorkshopSelectors from './freecompany-workshop.selectors';
import { concatMap, filter, map, switchMap, withLatestFrom } from 'rxjs/operators';
import { FreeCompanyWorkshop } from '../model/free-company-workshop';
import { ImportWorkshopFromPcapPopupComponent } from '../import-workshop-from-pcap-popup/import-workshop-from-pcap-popup.component';
import { NzModalService } from 'ng-zorro-antd/modal';
import { TranslateService } from '@ngx-translate/core';
import { EMPTY, of, Subject } from 'rxjs';
import { IpcService } from '../../../core/electron/ipc.service';
import { FreeCompanyWorkshops } from '../model/free-company-workshops';
import { NgSerializerService } from '@kaiu/ng-serializer';
import { select, Store } from '@ngrx/store';
import { VesselType } from '../model/vessel-type';
import { FreeCompanyWorkshopFacade } from './free-company-workshop.facade';
import { VesselTimersUpdate } from '../model/vessel-timers-update';
import { cloneDeep } from 'lodash';
import { VesselPart } from '../model/vessel-part';

@Injectable()
export class FreeCompanyWorkshopEffects {

  readFromFile$ = createEffect(() => this.actions$.pipe(
    ofType(FreeCompanyWorkshopActions.readFromFile),
    switchMap(() => {
      const result$ = new Subject<FreeCompanyWorkshop[]>();
      this.ipc.once('free-company-workshops:value', (e, workshops) => {
        const data = this.serializer.deserialize<FreeCompanyWorkshops>(workshops, FreeCompanyWorkshops);
        result$.next(data.freeCompanyWorkshops);
      });
      setTimeout(() => {
        this.ipc.send('free-company-workshops:get');
      }, 200);
      return result$;
    }),
    map(freeCompanyWorkshops => FreeCompanyWorkshopActions.loadFreeCompanyWorkshops({ freeCompanyWorkshops }))
  ));

  saveToFile$ = createEffect(() => this.actions$.pipe(
    ofType(FreeCompanyWorkshopActions.saveToFile),
    concatMap((action) => of(action).pipe(
      withLatestFrom(this.store.pipe(select(FreeCompanyWorkshopSelectors.selectWorkshops)))
    )),
    switchMap(([, state]) => {
      const savePayload = JSON.parse(JSON.stringify({ freeCompanyWorkshops: state }));
      this.ipc.send('free-company-workshops:set', savePayload);
      return EMPTY;
    })
  ), { dispatch: false });

  deleteFreeCompanyWorkshop$ = createEffect(() => this.actions$.pipe(
    ofType(FreeCompanyWorkshopActions.deleteFreeCompanyWorkshop),
    map(() => FreeCompanyWorkshopActions.saveToFile())
  ));

  importFromPcap$ = createEffect(() => this.actions$.pipe(
    ofType(FreeCompanyWorkshopActions.importFromPcap),
    switchMap(() => {
        return this.dialog.create({
          nzContent: ImportWorkshopFromPcapPopupComponent,
          nzFooter: null,
          nzTitle: this.translate.instant('VOYAGE_TRACKER.Import_using_pcap')
        }).afterClose.pipe(
          filter(opts => opts)
        );
      }
    ),
    map((workshop: FreeCompanyWorkshop) => {
      this.store.dispatch(FreeCompanyWorkshopActions.upsertFreeCompanyWorkshop({ freeCompanyWorkshop: workshop }));
      return FreeCompanyWorkshopActions.saveToFile();
    })
  ));

  updateAirshipStatus$ = createEffect(() => this.actions$.pipe(
    ofType(FreeCompanyWorkshopActions.updateAirshipStatus),
    concatMap((action) => of(action).pipe(
      withLatestFrom(this.freeCompanyWorkshopFacade.currentWorkshop$)
    )),
    map(([{ slot, vessel }, state]) => {
      const vesselState = cloneDeep(state.airships);
      vesselState.slots[slot] = vessel;
      this.store.dispatch(FreeCompanyWorkshopActions.updateFreeCompanyWorkshop({
        freeCompanyWorkshop: {
          id: state.id,
          changes: {
            airships: vesselState
          }
        }
      }));
      return FreeCompanyWorkshopActions.saveToFile();
    })
  ));

  updateAirshipStatusList$ = createEffect(() => this.actions$.pipe(
    ofType(FreeCompanyWorkshopActions.updateAirshipStatusList),
    concatMap((action) => of(action).pipe(
      withLatestFrom(this.freeCompanyWorkshopFacade.currentWorkshop$)
    )),
    map(([{ vessels }, state]) => {
      const vesselState = cloneDeep(state.airships);
      vesselState.slots = vesselState.slots.map((vessel, i) => {
        if (vessel) {
          vessel.rank = vessels[i].rank;
          vessel.status = vessels[i].status;
          vessel.name = vessels[i].name;
          vessel.birthdate = vessels[i].birthdate;
          vessel.returnTime = vessels[i].returnTime;
        }
        return vessel;
      });
      this.store.dispatch(FreeCompanyWorkshopActions.updateFreeCompanyWorkshop({
        freeCompanyWorkshop: {
          id: state.id,
          changes: {
            airships: vesselState
          }
        }
      }));
      return FreeCompanyWorkshopActions.saveToFile();
    })
  ));

  updateSubmarineStatusList$ = createEffect(() => this.actions$.pipe(
    ofType(FreeCompanyWorkshopActions.updateSubmarineStatusList),
    concatMap((action) => of(action).pipe(
      withLatestFrom(this.freeCompanyWorkshopFacade.currentWorkshop$)
    )),
    map(([{ vessels }, state]) => {
      const vesselState = cloneDeep(state.submarines);
      vesselState.slots = vessels;
      this.store.dispatch(FreeCompanyWorkshopActions.updateFreeCompanyWorkshop({
        freeCompanyWorkshop: {
          id: state.id,
          changes: {
            submarines: vesselState
          }
        }
      }));
      return FreeCompanyWorkshopActions.saveToFile();
    })
  ));

  updateVesselTimers$ = createEffect(() => this.actions$.pipe(
    ofType(FreeCompanyWorkshopActions.updateVesselTimers),
    concatMap((action) => of(action).pipe(
      withLatestFrom(this.freeCompanyWorkshopFacade.currentWorkshop$)
    )),
    map(([{ vesselTimersUpdate }, state]) => {
      let changes;

      if (vesselTimersUpdate.type === VesselType.AIRSHIP && state.airships?.slots) {
        changes = {
          airships: this.updateVesselTimers(cloneDeep(state.airships), vesselTimersUpdate)
        };
      } else if (vesselTimersUpdate.type === VesselType.SUBMARINE && state.submarines?.slots) {
        changes = {
          submarines: this.updateVesselTimers(cloneDeep(state.submarines), vesselTimersUpdate)
        };
      } else {
        console.log('VesselType NOT FOUND', vesselTimersUpdate.type);
      }

      this.store.dispatch(FreeCompanyWorkshopActions.updateFreeCompanyWorkshop({
        freeCompanyWorkshop: {
          id: state.id,
          changes: changes
        }
      }));

      return FreeCompanyWorkshopActions.saveToFile();
    })
  ));

  updateVesselPart$ = createEffect(() => this.actions$.pipe(
    ofType(FreeCompanyWorkshopActions.updateVesselPart),
    concatMap((action) => of(action).pipe(
      withLatestFrom(this.freeCompanyWorkshopFacade.currentWorkshop$)
    )),
    filter(([, state]) => state !== undefined),
    map(([{ vesselPartUpdate }, state]) => {
      const vesselSlot = vesselPartUpdate.vesselSlot;
      const partSlot = vesselPartUpdate.partSlot;
      const vesselPart: VesselPart = {
        partId: vesselPartUpdate.partId,
        condition: vesselPartUpdate.condition
      };

      const newState = cloneDeep(state);
      let changes;

      if (vesselPartUpdate.type === VesselType.AIRSHIP && state.airships?.slots) {
        if (newState.airships.slots[vesselSlot]?.parts[partSlot]) {
          newState.airships.slots[vesselSlot].parts[partSlot] = vesselPart;
          changes = {
            airships: newState.airships
          };
        }
      } else if (vesselPartUpdate.type === VesselType.SUBMARINE && state.submarines?.slots) {
        if (newState.submarines.slots[vesselSlot]?.parts[partSlot]) {
          newState.submarines.slots[vesselSlot].parts[partSlot] = vesselPart;
          changes = {
            submarines: newState.submarines
          };
        }
      } else {
        console.log('VesselType NOT FOUND', vesselPartUpdate.type);
      }

      if (changes !== undefined) {
        this.store.dispatch(FreeCompanyWorkshopActions.updateFreeCompanyWorkshop({
          freeCompanyWorkshop: {
            id: state.id,
            changes: changes
          }
        }));
      }

      return FreeCompanyWorkshopActions.saveToFile();
    })
  ));

  updateVesselProgressionStatus$ = createEffect(() => this.actions$.pipe(
    ofType(FreeCompanyWorkshopActions.updateVesselProgressionStatus),
    concatMap((action) => of(action).pipe(
      withLatestFrom(this.freeCompanyWorkshopFacade.currentWorkshop$)
    )),
    filter(([, state]) => state !== undefined),
    map(([{ vesselProgressionStatusUpdate }, state]) => {
      const newState = cloneDeep(state);
      let changes;

      if (vesselProgressionStatusUpdate.type === VesselType.AIRSHIP) {
        changes = {
          airships: {
            ...newState.airships,
            sectors: vesselProgressionStatusUpdate.sectorsProgression
          }
        };
      } else if (vesselProgressionStatusUpdate.type === VesselType.SUBMARINE) {
        changes = {
          submarines: {
            ...newState.submarines,
            sectors: vesselProgressionStatusUpdate.sectorsProgression
          }
        };
      }

      if (changes !== undefined) {
        this.store.dispatch(FreeCompanyWorkshopActions.updateFreeCompanyWorkshop({
          freeCompanyWorkshop: {
            id: state.id,
            changes: changes
          }
        }));
      }

      return FreeCompanyWorkshopActions.saveToFile();
    })
  ));

  constructor(private actions$: Actions, private dialog: NzModalService,
              private ipc: IpcService, private translate: TranslateService,
              private freeCompanyWorkshopFacade: FreeCompanyWorkshopFacade,
              private store: Store, private serializer: NgSerializerService) {
  }

  private updateVesselTimers(vesselState, vesselTimersUpdate: VesselTimersUpdate): any {
    if (vesselState) {
      vesselState.slots = vesselState.slots.map((vessel, i) => {
        if (!vessel) {
          vessel = {};
        }
        vessel.name = vesselTimersUpdate.timers[i].name;
        vessel.returnTime = vesselTimersUpdate.timers[i].returnTime;
        vessel.destinations = vesselTimersUpdate.timers[i].destinations;
        return vessel;
      });
      return vesselState;
    }
    return {};
  }
}
