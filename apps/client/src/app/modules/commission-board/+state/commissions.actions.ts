import { createAction, props } from '@ngrx/store';
import { Commission } from '../model/commission';

export const loadUserCommissions = createAction('[Commissions] Load User Commissions as Client');
export const loadCommission = createAction('[Commissions] Load Commission', props<{ key: string }>());

export const commissionsLoaded = createAction(
  '[Commissions] Commissions Loaded',
  props<{ commissions: Commission[], userId: string }>()
);

export const commissionLoaded = createAction(
  '[Commissions] Load Commission',
  props<{ commission: Commission }>()
);

export const createCommission = createAction(
  '[Commissions] Create Commission',
  props<{ name: string, listKey?: string }>()
);

export const selectCommission = createAction(
  '[Commissions] Select Commission',
  props<{ key: string }>()
);

export const updateCommission = createAction(
  '[Commissions] Update Commission',
  props<{ commission: Commission }>()
);

export const deleteCommission = createAction(
  '[Commissions] Delete Commission',
  props<{ key: string, deleteList: boolean }>()
);
