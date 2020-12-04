import { createAction, props } from '@ngrx/store';
import { List } from '../../list/model/list';
import { Commission } from '../model/commission';

export const loadUserCommissions = createAction('[Commissions] Load User Commissions', props<{ archived: boolean }>());
export const loadCommission = createAction('[Commissions] Load Commission', props<{ key: string }>());

export const commissionsLoaded = createAction(
  '[Commissions] Commissions Loaded',
  props<{ commissions: Commission[], userId: string }>()
);

export const commissionLoaded = createAction(
  '[Commissions] Commission Loaded',
  props<{ commission: Commission }>()
);

export const createCommission = createAction(
  '[Commissions] Create Commission',
  props<{ name: string, list?: List, template?: Partial<Commission> }>()
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
