import { createAction, props } from '@ngrx/store';
import { Commission } from '../model/commission';

export const loadCommissions = createAction('[Commissions] Load Commissions');

export const loadCommissionsSuccess = createAction(
  '[Commissions] Load Commissions Success',
  props<{ commissions: Commission[] }>()
);

export const createCommission = createAction(
  '[Commissions] Create Commission',
  props<{ name: string, listKey?: string }>()
);
