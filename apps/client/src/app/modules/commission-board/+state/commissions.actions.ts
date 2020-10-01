import { createAction, props } from '@ngrx/store';
import { Commission } from '../model/commission';

export const loadUserCommissionsAsClient = createAction('[Commissions] Load User Commissions as Client');
export const loadUserCommissionsAsCrafter = createAction('[Commissions] Load User Commissions as Crafter', props<{ userId: string }>());
export const loadCommissionsPerDatacenter = createAction('[Commissions] Load Datacenter Commissions', props<{ datacenter: string }>());

export const commissionsLoaded = createAction(
  '[Commissions] Commissions Loaded',
  props<{ commissions: Commission[] }>()
);

export const createCommission = createAction(
  '[Commissions] Create Commission',
  props<{ name: string, listKey?: string }>()
);
