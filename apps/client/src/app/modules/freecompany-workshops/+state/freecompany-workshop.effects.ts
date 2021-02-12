import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as FreecompanyWorkshopActions from './freecompany-workshop.actions';
import * as FreecompanyWorkshopSelectors from './freecompany-workshop.selectors';
import { concatMap, filter, map, switchMap, withLatestFrom } from 'rxjs/operators';
import { FreecompanyWorkshop } from '../model/freecompany-workshop';
import { ImportWorkshopFromPcapPopupComponent } from '../import-workshop-from-pcap-popup/import-workshop-from-pcap-popup.component';
import { NzModalService } from 'ng-zorro-antd/modal';
import { TranslateService } from '@ngx-translate/core';
import { EMPTY, of, Subject } from 'rxjs';
import { IpcService } from '../../../core/electron/ipc.service';
import { FreecompanyWorkshops } from '../model/freecompany-workshops';
import { NgSerializerService } from '@kaiu/ng-serializer';
import { select, Store } from '@ngrx/store';
import { VesselType } from '../model/vessel-type';
import { FreecompanyWorkshopFacade } from './freecompany-workshop.facade';
import { VesselTimersUpdate } from '../model/vessel-timers-update';

@Injectable()
export class FreecompanyWorkshopEffects {

  readFromFile$ = createEffect(() => this.actions$.pipe(
    ofType(FreecompanyWorkshopActions.readFromFile),
    switchMap(() => {
      const result$ = new Subject<FreecompanyWorkshop[]>();
      this.ipc.once('freecompany-workshops:value', (e, workshops) => {
        const data = this.serializer.deserialize<FreecompanyWorkshops>(workshops, FreecompanyWorkshops);
        result$.next(data.freecompanyWorkshops);
      });
      setTimeout(() => {
        this.ipc.send('freecompany-workshops:get');
      }, 200);
      return result$;
    }),
    map(freecompanyWorkshops => FreecompanyWorkshopActions.loadFreecompanyWorkshops({ freecompanyWorkshops }))
  ));

  saveToFile$ = createEffect(() => this.actions$.pipe(
    ofType(FreecompanyWorkshopActions.saveToFile),
    concatMap((action) => of(action).pipe(
      withLatestFrom(this.store.pipe(select(FreecompanyWorkshopSelectors.selectWorkshops)))
    )),
    switchMap(([, state]) => {
      const savePayload = JSON.parse(JSON.stringify({ freecompanyWorkshops: state }));
      this.ipc.send('freecompany-workshops:set', savePayload);
      return EMPTY;
    })
  ), { dispatch: false });

  importFromPcap$ = createEffect(() => this.actions$.pipe(
    ofType(FreecompanyWorkshopActions.importFromPcap),
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
    map((workshop: FreecompanyWorkshop) => {
      this.store.dispatch(FreecompanyWorkshopActions.upsertFreecompanyWorkshop({ freecompanyWorkshop: workshop }));
      return FreecompanyWorkshopActions.saveToFile();
    })
  ));

  updateAirshipStatus$ = createEffect(() => this.actions$.pipe(
    ofType(FreecompanyWorkshopActions.updateAirshipStatus),
    concatMap((action) => of(action).pipe(
      withLatestFrom(this.freecompanyWorkshopFacade.currentWorkshop$)
    )),
    map(([{ slot, vessel }, state]) => {
      const vesselState = { ...state.airships };
      vesselState.slots[slot] = vessel;
      this.store.dispatch(FreecompanyWorkshopActions.updateFreecompanyWorkshop({
        freecompanyWorkshop: {
          id: state.id,
          changes: {
            airships: vesselState
          }
        }
      }));
      return FreecompanyWorkshopActions.saveToFile();
    })
  ));

  updateAirshipStatusList$ = createEffect(() => this.actions$.pipe(
    ofType(FreecompanyWorkshopActions.updateAirshipStatusList),
    concatMap((action) => of(action).pipe(
      withLatestFrom(this.freecompanyWorkshopFacade.currentWorkshop$)
    )),
    map(([{ vessels }, state]) => {
      const vesselState = { ...state.airships };
      vesselState.slots = vesselState.slots.map((vessel, i) => {
        vessel.rank = vessels[i].rank;
        vessel.status = vessels[i].status;
        vessel.name = vessels[i].name;
        vessel.birthdate = vessels[i].birthdate;
        vessel.returnTime = vessels[i].returnTime;
        return vessel;
      });
      this.store.dispatch(FreecompanyWorkshopActions.updateFreecompanyWorkshop({
        freecompanyWorkshop: {
          id: state.id,
          changes: {
            airships: vesselState
          }
        }
      }));
      return FreecompanyWorkshopActions.saveToFile();
    })
  ));

  updateSubmarineStatusList$ = createEffect(() => this.actions$.pipe(
    ofType(FreecompanyWorkshopActions.updateSubmarineStatusList),
    concatMap((action) => of(action).pipe(
      withLatestFrom(this.freecompanyWorkshopFacade.currentWorkshop$)
    )),
    map(([{ vessels }, state]) => {
      const vesselState = { ...state.submarines };
      vesselState.slots = vessels;
      this.store.dispatch(FreecompanyWorkshopActions.updateFreecompanyWorkshop({
        freecompanyWorkshop: {
          id: state.id,
          changes: {
            submarines: vesselState
          }
        }
      }));
      return FreecompanyWorkshopActions.saveToFile();
    })
  ));

  updateVesselTimers$ = createEffect(() => this.actions$.pipe(
    ofType(FreecompanyWorkshopActions.updateVesselTimers),
    concatMap((action) => of(action).pipe(
      withLatestFrom(this.freecompanyWorkshopFacade.currentWorkshop$)
    )),
    map(([{ vesselTimersUpdate }, state]) => {
      let changes;

      if (vesselTimersUpdate.type === VesselType.AIRSHIP && state.airships?.slots) {
        changes = {
          airships: this.updateVesselTimers({ ...state.airships }, vesselTimersUpdate)
        };
      } else if (vesselTimersUpdate.type === VesselType.SUBMARINE && state.submarines?.slots) {
        changes = {
          submarines: this.updateVesselTimers({ ...state.submarines }, vesselTimersUpdate)
        };
      } else {
        console.log('VesselType NOT FOUND', vesselTimersUpdate.type);
      }

      this.store.dispatch(FreecompanyWorkshopActions.updateFreecompanyWorkshop({
        freecompanyWorkshop: {
          id: state.id,
          changes: changes
        }
      }));

      return FreecompanyWorkshopActions.saveToFile();
    })
  ));

  updateVesselPart$ = createEffect(() => this.actions$.pipe(
    ofType(FreecompanyWorkshopActions.updateVesselPart),
    concatMap((action) => of(action).pipe(
      withLatestFrom(this.freecompanyWorkshopFacade.currentWorkshop$)
    )),
    map(([{ vesselPartUpdate }, state]) => {
      const vesselSlot = vesselPartUpdate.vesselSlot;
      const partSlotName = this.freecompanyWorkshopFacade.getVesselPartSlotName(vesselPartUpdate.partSlot);
      let changes;

      if (vesselPartUpdate.type === VesselType.AIRSHIP && state.airships?.slots) {
        const airshipsState = { ...state.airships };
        if (airshipsState.slots[vesselSlot]) {
          airshipsState.slots[vesselSlot].parts[partSlotName].condition = vesselPartUpdate.condition;
          changes = {
            airships: {
              ...airshipsState
            }
          };
        }
      } else if (vesselPartUpdate.type === VesselType.SUBMARINE && state.submarines?.slots) {
        const submarinesState = { ...state.submarines };
        if (submarinesState.slots[vesselSlot]) {
          submarinesState.slots[vesselSlot].parts[partSlotName].condition = vesselPartUpdate.condition;
          changes = {
            submarines: {
              ...submarinesState
            }
          };
        }
      } else {
        console.log('VesselType NOT FOUND', vesselPartUpdate.type);
      }

      if (changes !== undefined) {
        this.store.dispatch(FreecompanyWorkshopActions.updateFreecompanyWorkshop({
          freecompanyWorkshop: {
            id: state.id,
            changes: changes
          }
        }));
      }

      return FreecompanyWorkshopActions.saveToFile();
    })
  ));

  constructor(private actions$: Actions, private dialog: NzModalService,
              private ipc: IpcService, private translate: TranslateService,
              private freecompanyWorkshopFacade: FreecompanyWorkshopFacade,
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
