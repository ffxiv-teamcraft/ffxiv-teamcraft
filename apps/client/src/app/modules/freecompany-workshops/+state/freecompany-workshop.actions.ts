import { createAction, props } from '@ngrx/store';
import { Update } from '@ngrx/entity';

import { FreecompanyWorkshop } from '../model/freecompany-workshop';

export const readFromFile = createAction(
  '[FreecompanyWorkshop/API] Read from file',
);

export const saveToFile = createAction(
  '[FreecompanyWorkshop/API] Save to file',
);

export const importFromPcap = createAction(
  '[FreecompanyWorkshop/API] Import from Pcap',
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
