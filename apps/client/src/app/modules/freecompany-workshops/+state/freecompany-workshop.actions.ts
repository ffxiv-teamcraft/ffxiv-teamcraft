import { createAction, props } from '@ngrx/store';
import { Update } from '@ngrx/entity';

import { FreecompanyWorkshop } from '../model/freecompany-workshop';
import { VesselPartUpdate } from '../model/vessel-part-update';
import { VesselTimersUpdate } from '../model/vessel-timers-update';
import { Submarine } from '../model/submarine';
import { Airship } from '../model/airship';

export const readFromFile = createAction(
  '[FreecompanyWorkshop/API] Read from file'
);

export const saveToFile = createAction(
  '[FreecompanyWorkshop/API] Save to file'
);

export const importFromPcap = createAction(
  '[FreecompanyWorkshop/API] Import from Pcap'
);

export const updateVesselPart = createAction(
  '[FreecompanyWorkshop/API] Update vessel part',
  props<{ vesselPartUpdate: VesselPartUpdate }>()
);

export const updateAirshipStatus = createAction(
  '[FreecompanyWorkshop/API] Update airship status',
  props<{ slot: number, vessel: Airship }>()
);

export const updateAirshipStatusList = createAction(
  '[FreecompanyWorkshop/API] Update airship status list',
  props<{ vessels: Airship[] }>()
);

export const updateSubmarineStatusList = createAction(
  '[FreecompanyWorkshop/API] Update submarine status list',
  props<{ vessels: Submarine[] }>()
);

export const updateVesselTimers = createAction(
  '[FreecompanyWorkshop/API] Update vessel timers',
  props<{ vesselTimersUpdate: VesselTimersUpdate }>()
);

export const setFreecompanyId = createAction(
  '[FreecompanyWorkshop/API] Set Free company ID',
  props<{ id: string }>()
);

export const loadFreecompanyWorkshops = createAction(
  '[FreecompanyWorkshop/API] Load FreecompanyWorkshops',
  props<{ freecompanyWorkshops: FreecompanyWorkshop[] }>()
);

export const addFreecompanyWorkshop = createAction(
  '[FreecompanyWorkshop/API] Add FreecompanyWorkshop',
  props<{ freecompanyWorkshop: FreecompanyWorkshop }>()
);

export const upsertFreecompanyWorkshop = createAction(
  '[FreecompanyWorkshop/API] Upsert FreecompanyWorkshop',
  props<{ freecompanyWorkshop: FreecompanyWorkshop }>()
);

export const addFreecompanyWorkshops = createAction(
  '[FreecompanyWorkshop/API] Add FreecompanyWorkshops',
  props<{ freecompanyWorkshops: FreecompanyWorkshop[] }>()
);

export const upsertFreecompanyWorkshops = createAction(
  '[FreecompanyWorkshop/API] Upsert FreecompanyWorkshops',
  props<{ freecompanyWorkshops: FreecompanyWorkshop[] }>()
);

export const updateFreecompanyWorkshop = createAction(
  '[FreecompanyWorkshop/API] Update FreecompanyWorkshop',
  props<{ freecompanyWorkshop: Update<FreecompanyWorkshop> }>()
);

export const updateFreecompanyWorkshops = createAction(
  '[FreecompanyWorkshop/API] Update FreecompanyWorkshops',
  props<{ freecompanyWorkshops: Update<FreecompanyWorkshop>[] }>()
);

export const deleteFreecompanyWorkshop = createAction(
  '[FreecompanyWorkshop/API] Delete FreecompanyWorkshop',
  props<{ id: string }>()
);

export const deleteFreecompanyWorkshops = createAction(
  '[FreecompanyWorkshop/API] Delete FreecompanyWorkshops',
  props<{ ids: string[] }>()
);

export const clearFreecompanyWorkshops = createAction(
  '[FreecompanyWorkshop/API] Clear FreecompanyWorkshops'
);
