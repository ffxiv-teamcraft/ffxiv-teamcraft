import { createAction, props } from '@ngrx/store';
import { Update } from '@ngrx/entity';

import { FreeCompanyWorkshop } from '../model/free-company-workshop';
import { VesselPartUpdate } from '../model/vessel-part-update';
import { VesselTimersUpdate } from '../model/vessel-timers-update';
import { Submarine } from '../model/submarine';
import { Airship } from '../model/airship';
import { VesselProgressionStatusUpdate } from '../model/vessel-progression-status-update';

export const readFromFile = createAction(
  '[FreeCompanyWorkshop/API] Read from file'
);

export const saveToFile = createAction(
  '[FreeCompanyWorkshop/API] Save to file'
);

export const importFromPcap = createAction(
  '[FreeCompanyWorkshop/API] Import from Pcap'
);

export const updateVesselPart = createAction(
  '[FreeCompanyWorkshop/API] Update vessel part',
  props<{ vesselPartUpdate: VesselPartUpdate }>()
);

export const updateAirshipStatus = createAction(
  '[FreeCompanyWorkshop/API] Update airship status',
  props<{ slot: number, vessel: Airship }>()
);

export const updateAirshipStatusList = createAction(
  '[FreeCompanyWorkshop/API] Update airship status list',
  props<{ vessels: Airship[] }>()
);

export const updateSubmarineStatusList = createAction(
  '[FreeCompanyWorkshop/API] Update submarine status list',
  props<{ vessels: Submarine[] }>()
);

export const updateVesselTimers = createAction(
  '[FreeCompanyWorkshop/API] Update vessel timers',
  props<{ vesselTimersUpdate: VesselTimersUpdate }>()
);

export const updateVesselProgressionStatus = createAction(
  '[FreeCompanyWorkshop/API] Update vessel progression',
  props<{ vesselProgressionStatusUpdate: VesselProgressionStatusUpdate }>()
);

export const setFreeCompanyId = createAction(
  '[FreeCompanyWorkshop/API] Set Free company ID',
  props<{ id: string }>()
);

export const loadFreeCompanyWorkshops = createAction(
  '[FreeCompanyWorkshop/API] Load FreeCompanyWorkshops',
  props<{ freeCompanyWorkshops: FreeCompanyWorkshop[] }>()
);

export const addFreeCompanyWorkshop = createAction(
  '[FreeCompanyWorkshop/API] Add FreeCompanyWorkshop',
  props<{ freeCompanyWorkshop: FreeCompanyWorkshop }>()
);

export const upsertFreeCompanyWorkshop = createAction(
  '[FreeCompanyWorkshop/API] Upsert FreeCompanyWorkshop',
  props<{ freeCompanyWorkshop: FreeCompanyWorkshop }>()
);

export const addFreeCompanyWorkshops = createAction(
  '[FreeCompanyWorkshop/API] Add FreeCompanyWorkshops',
  props<{ freeCompanyWorkshops: FreeCompanyWorkshop[] }>()
);

export const upsertFreeCompanyWorkshops = createAction(
  '[FreeCompanyWorkshop/API] Upsert FreeCompanyWorkshops',
  props<{ freeCompanyWorkshops: FreeCompanyWorkshop[] }>()
);

export const updateFreeCompanyWorkshop = createAction(
  '[FreeCompanyWorkshop/API] Update FreeCompanyWorkshop',
  props<{ freeCompanyWorkshop: Update<FreeCompanyWorkshop> }>()
);

export const updateFreeCompanyWorkshops = createAction(
  '[FreeCompanyWorkshop/API] Update FreeCompanyWorkshops',
  props<{ freeCompanyWorkshops: Update<FreeCompanyWorkshop>[] }>()
);

export const deleteFreeCompanyWorkshop = createAction(
  '[FreeCompanyWorkshop/API] Delete FreeCompanyWorkshop',
  props<{ id: string }>()
);

export const deleteFreeCompanyWorkshops = createAction(
  '[FreeCompanyWorkshop/API] Delete FreeCompanyWorkshops',
  props<{ ids: string[] }>()
);

export const clearFreeCompanyWorkshops = createAction(
  '[FreeCompanyWorkshop/API] Clear FreeCompanyWorkshops'
);
