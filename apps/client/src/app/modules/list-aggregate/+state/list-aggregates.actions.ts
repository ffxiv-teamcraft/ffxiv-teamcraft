import { createAction, props } from '@ngrx/store';
import { ListAggregate } from '../model/list-aggregate';
import { UpdateData } from '@angular/fire/firestore';

const PREFIX = '[ListAggregates]';

export const loadListAggregates = createAction(
  `${PREFIX} Load List Aggregates`
);

export const listAggregatesLoaded = createAction(
  `${PREFIX} List Aggregates Loaded`,
  props<{ aggregates: ListAggregate[] }>()
);

export const selectListAggregate = createAction(
  `${PREFIX} Select List Aggregate`,
  props<{ id: string }>()
);

export const loadListAggregate = createAction(
  `${PREFIX} Load List Aggregate`,
  props<{ id: string }>()
);

export const listAggregateLoaded = createAction(
  `${PREFIX} List Aggregate Loaded`,
  props<{ aggregate: ListAggregate }>()
);

export const createListAggregate = createAction(
  `${PREFIX} Create List Aggregate`,
  props<{ aggregate: ListAggregate }>()
);

export const updateListAggregate = createAction(
  `${PREFIX} Update List Aggregate`,
  props<{ aggregate: ListAggregate }>()
);

export const pureUpdateListAggregate = createAction(
  `${PREFIX} Pure Update List Aggregate`,
  props<{ $key: string, update: UpdateData<ListAggregate> }>()
);

export const deleteListAggregate = createAction(
  `${PREFIX} Delete List Aggregate`,
  props<{ id: string }>()
);




